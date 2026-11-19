
import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("sign");
  const [cameraOn, setCameraOn] = useState(false);
  const [message, setMessage] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const [recognizedText, setRecognizedText] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [recognizing, setRecognizing] = useState(false);
  const [recognitionMessage, setRecognitionMessage] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await videoRef.current.play();

      setCameraOn(true);
      setRecognitionMessage("Camera started. Show a trained sign.");
      setRecognizedText("");
      setConfidence(null);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Please allow camera access to continue.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setRecognitionMessage("Camera stopped.");
  };

  // Capture webcam image and send it to FastAPI
  const recognizeSign = async () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) {
      setRecognitionMessage("Please start the camera first.");
      return;
    }

    setRecognizing(true);
    setRecognitionMessage("Recognizing sign...");

    try {
      const video = videoRef.current;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) {
        throw new Error("Could not capture webcam image.");
      }

      const formData = new FormData();
      formData.append("file", blob, "webcam.jpg");

      const response = await fetch(
        "http://localhost:8000/predict-sign",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Backend request failed.");
      }

      if (data.success) {
        setRecognizedText(data.prediction);
        setConfidence(data.confidence);
        setRecognitionMessage(data.message);
      } else {
        setRecognizedText("");
        setConfidence(null);
        setRecognitionMessage(data.message || "Sign not recognized.");
      }
    } catch (error) {
      console.error("Recognition error:", error);
      setRecognitionMessage(
        "Recognition failed. Check whether the backend is running."
      );
    } finally {
      setRecognizing(false);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    setTranslatedText(message);
    setMessage("");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🤟 ISL Connect</h2>
        <p className="tagline">Breaking communication barriers</p>

        <button
          className={activeTab === "sign" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("sign")}
        >
          📷 Sign to Text
        </button>

        <button
          className={activeTab === "text" ? "nav-btn active" : "nav-btn"}
          onClick={() => setActiveTab("text")}
        >
          💬 Text to Sign
        </button>

        <div className="sidebar-bottom">
          <p>AI Powered Communication</p>
          <small>Indian Sign Language</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Welcome to ISL Connect</h1>
            <p>Communicate without barriers.</p>
          </div>

          <span className="status">● System Ready</span>
        </header>

        {activeTab === "sign" ? (
          <section className="workspace">
            <div className="section-heading">
              <h2>Sign Language to Text</h2>
              <p>Show your signs in front of the camera.</p>
            </div>

            <div className="content-grid">
              <div className="panel camera-panel">
                <h3>📷 Camera Preview</h3>

                <div className="camera-box">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                  />

                  {!cameraOn && (
                    <div className="camera-placeholder">
                      <span>📹</span>
                      <p>Camera preview will appear here</p>
                    </div>
                  )}
                </div>

                <div className="button-row">
                  <button
                    className="primary-btn"
                    onClick={startCamera}
                    disabled={cameraOn}
                  >
                    Start Camera
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={stopCamera}
                    disabled={!cameraOn}
                  >
                    Stop Camera
                  </button>
                </div>

                <button
                  className="primary-btn"
                  onClick={recognizeSign}
                  disabled={!cameraOn || recognizing}
                  style={{ marginTop: "12px", width: "100%" }}
                >
                  {recognizing ? "Recognizing..." : "🤟 Recognize Sign"}
                </button>
              </div>

              <div className="panel output-panel">
                <h3>📝 Recognized Text</h3>

                <div className="output-box">
                  {recognizedText ? (
                    <>
                      <h2>{recognizedText}</h2>
                      <p>
                        Confidence:{" "}
                        {confidence !== null
                          ? `${(confidence * 100).toFixed(2)}%`
                          : "N/A"}
                      </p>
                    </>
                  ) : (
                    <p>
                      Your recognized sign language will appear here.
                    </p>
                  )}
                </div>

                <p className="info-text">
                  {recognitionMessage ||
                    "Start your camera and click Recognize Sign."}
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="workspace">
            <div className="section-heading">
              <h2>Text to Sign Language</h2>
              <p>Type a message to communicate using ISL.</p>
            </div>

            <div className="panel text-panel">
              <h3>💬 Enter Your Message</h3>

              <textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <button className="primary-btn" onClick={sendMessage}>
                Convert to Sign
              </button>

              <div className="avatar-box">
                <h3>🤟 Sign Language Avatar</h3>

                {translatedText ? (
                  <p>Your message: {translatedText}</p>
                ) : (
                  <p>Your sign language avatar will appear here.</p>
                )}

                <small>3D avatar integration will be added later.</small>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
