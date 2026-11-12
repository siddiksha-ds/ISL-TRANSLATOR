import cv2
import numpy as np
import joblib

from hand_tracking.landmark_detector import LiveLandmarkDetector

# Load trained AI model
model = joblib.load("models/isl_model.pkl")

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

            if landmarks.shape == (21, 3):
                features = landmarks.flatten().reshape(1, -1)

                # Predict sign
                prediction = model.predict(features)[0]
                probabilities = model.predict_proba(features)[0]
                confidence = np.max(probabilities)

                if confidence >= 0.60:
                    text = f"Sign: {prediction}"
                else:
                    text = "Sign: Uncertain"

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

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

finally:
    camera.release()
    detector.landmarker.close()
    cv2.destroyAllWindows()