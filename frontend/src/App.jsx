import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("sign");
  const [cameraOn, setCameraOn] = useState(false);
  const [message, setMessage] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      alert("Please allow camera access to continue.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
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
                  <video ref={videoRef} autoPlay playsInline muted />
                  {!cameraOn && (
                    <div className="camera-placeholder">
                      <span>📹</span>
                      <p>Camera preview will appear here</p>
                    </div>
                  )}
                </div>

                <div className="button-row">
                  <button className="primary-btn" onClick={startCamera}>
                    Start Camera
                  </button>
                  <button className="secondary-btn" onClick={stopCamera}>
                    Stop Camera
                  </button>
                </div>
              </div>

              <div className="panel output-panel">
                <h3>📝 Recognized Text</h3>
                <div className="output-box">
                  <p>
                    Your recognized sign language will appear here.
                  </p>
                </div>
                <p className="info-text">
                  Sign recognition will be connected to the AI backend.
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