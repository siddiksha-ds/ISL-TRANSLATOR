
import cv2
import numpy as np
import joblib
import pyttsx3
import time
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Load trained AI model
model = joblib.load("models/isl_model.pkl")

print("Model loaded successfully!")
print("Recognized signs:", model.classes_)

# Initialize text-to-speech
engine = pyttsx3.init()
engine.setProperty("rate", 150)
engine.setProperty("volume", 1.0)

last_prediction = None
last_spoken = None

# Initialize MediaPipe Hand Landmarker
MODEL_PATH = "hand_landmarker.task"

base_options = python.BaseOptions(
    model_asset_path=MODEL_PATH
)

options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=1,
    min_hand_detection_confidence=0.5,
    min_hand_presence_confidence=0.5,
    min_tracking_confidence=0.5,
    running_mode=vision.RunningMode.VIDEO
)

landmarker = vision.HandLandmarker.create_from_options(options)

# Start webcam
camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not camera.isOpened():
    print("Cannot open webcam")
    landmarker.close()
    exit()

start_time = time.monotonic()
last_timestamp = -1

print("\nISL Sign Recognition Started!")
print("Show your hand to the camera.")
print("Press S to speak the prediction.")
print("Press Q to quit.")

try:
    while True:

        success, frame = camera.read()

        if not success:
            print("Cannot read webcam frame")
            break

        # Mirror webcam
        frame = cv2.flip(frame, 1)

        # Convert image to RGB
        rgb_frame = cv2.cvtColor(
            frame, cv2.COLOR_BGR2RGB
        )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        # Generate timestamp
        timestamp = int(
            (time.monotonic() - start_time) * 1000
        )

        timestamp = max(
            timestamp, last_timestamp + 1
        )

        last_timestamp = timestamp

        # Detect hand landmarks
        result = landmarker.detect_for_video(
            mp_image, timestamp
        )

        if result.hand_landmarks:

            hand_landmarks = result.hand_landmarks[0]

            # Extract all 21 landmarks in MediaPipe order
            landmarks = np.array(
                [
                    [point.x, point.y, point.z]
                    for point in hand_landmarks
                ],
                dtype=np.float32
            )

            if landmarks.shape == (21, 3):

                # Prepare 63 features
                features = landmarks.flatten().reshape(1, 63)

                # Predict sign
                prediction = model.predict(features)[0]

                probabilities = model.predict_proba(features)[0]
                confidence = np.max(probabilities)

                last_prediction = prediction

                # Display prediction
                cv2.putText(
                    frame,
                    f"Sign: {prediction}",
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
                    (0, 255, 255),
                    2
                )

                # Draw hand landmarks
                height, width, _ = frame.shape

                for point in hand_landmarks:
                    x = int(point.x * width)
                    y = int(point.y * height)

                    cv2.circle(
                        frame,
                        (x, y),
                        5,
                        (0, 255, 0),
                        -1
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

        cv2.imshow(
            "ISL Sign Recognition",
            frame
        )

        key = cv2.waitKey(1) & 0xFF

        # Speak prediction when S is pressed
        if key == ord("s") and last_prediction:

            if last_prediction != last_spoken:

                print("Speaking:", last_prediction)

                engine.say(last_prediction)
                engine.runAndWait()

                last_spoken = last_prediction

        elif key == ord("q"):
            break

finally:

    camera.release()
    landmarker.close()
    cv2.destroyAllWindows()
