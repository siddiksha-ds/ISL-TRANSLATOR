import pyttsx3
import cv2
import numpy as np
import joblib

from hand_tracking.landmark_detector import LiveLandmarkDetector

# Load trained AI model
model = joblib.load("models/isl_model.pkl")
engine = pyttsx3.init()
engine.setProperty("rate", 150)
engine.setProperty("volume", 1.0)

last_prediction = None

# Start hand detector
detector = LiveLandmarkDetector(number_of_hands=1)

# Start webcam
camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not camera.isOpened():
    print("Cannot open webcam")
    detector.landmarker.close()
    exit()

print("ISL recognition started!")
print("Press Q to close.")

try:
    while True:
        success, frame = camera.read()

        if not success:
            print("Cannot read webcam frame")
            break

        frame = cv2.flip(frame, 1)

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        detector.process_frame(rgb)

        latest_frame, hands = detector.get_latest_data()

        if hands:
            hand = hands[0]

            # Extract 21 landmarks
            points = [hand.wrist]

            for finger in ["thumb", "index", "middle", "ring", "pinky"]:
                points.extend(hand.fingers[finger])

            landmarks = np.asarray(
                points, dtype=np.float32
            )
            print("Wrist:", landmarks[0])
            print("Index finger:", landmarks[5])
            print("Middle finger:", landmarks[9])

            if landmarks.shape == (21, 3):
                features = landmarks.flatten().reshape(1, -1)

                # Predict sign
                prediction = model.predict(features)[0]
                last_prediction = prediction
                probabilities = model.predict_proba(features)[0]
                confidence = np.max(probabilities)
                for sign, probability in zip(model.classes_, probabilities):
                    print(f"{sign}: {probability:.3f}", end=" | ")

                    print()

                text = f"Prediction: {prediction}"

                cv2.putText(
                    frame,
                    f"Confidence: {confidence:.4f}",
                    (20, 90),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 255),
                    2
                )

                cv2.putText(
                    frame,
                    text,
                    (20, 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    (0, 255, 0),
                    2
                )

                cv2.putText(
                    frame,
                    f"Confidence: {confidence:.2f}",
                    (20, 90),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2
                )

        else:
            cv2.putText(
                frame,
                "Show your hand",
                (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                2
            )

        cv2.imshow("ISL Sign Recognition", frame)

        key = cv2.waitKey(1) & 0xFF

        if key == ord("s") and last_prediction:
            print("Speaking:", last_prediction)
            engine.say(last_prediction)
            engine.runAndWait()

        elif key == ord("q"):
            break   

finally:
    camera.release()
    detector.landmarker.close()
    cv2.destroyAllWindows()