import cv2
import mediapipe as mp
import time

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

MODEL_PATH = "hand_landmarker.task"

# Configure hand detection
base_options = python.BaseOptions(
    model_asset_path=MODEL_PATH
)

options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=2,
    min_hand_detection_confidence=0.5,
    min_hand_presence_confidence=0.5,
    min_tracking_confidence=0.5,
    running_mode=vision.RunningMode.VIDEO
)

# Create hand landmarker
landmarker = vision.HandLandmarker.create_from_options(options)

# Start webcam
camera = cv2.VideoCapture(0)

if not camera.isOpened():
    print("Cannot access webcam")
    landmarker.close()
    exit()

connections = [
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (17, 18), (18, 19), (19, 20),
    (0, 17)
]

start_time = time.monotonic()
last_timestamp = -1

print("Hand detection started. Press Q to quit.")

try:
    while True:
        success, frame = camera.read()

        if not success:
            print("Cannot read webcam frame")
            break

        frame = cv2.flip(frame, 1)

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        timestamp = int((time.monotonic() - start_time) * 1000)
        timestamp = max(timestamp, last_timestamp + 1)
        last_timestamp = timestamp

        result = landmarker.detect_for_video(
            mp_image, timestamp
        )

        hand_count = len(result.hand_landmarks)

        cv2.putText(
            frame,
            f"Hands detected: {hand_count}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )

        for hand_landmarks in result.hand_landmarks:

            height, width, _ = frame.shape
            points = []

            for landmark in hand_landmarks:
                x = int(landmark.x * width)
                y = int(landmark.y * height)
                points.append((x, y))

                cv2.circle(
                    frame, (x, y), 5,
                    (0, 255, 0), -1
                )

            for start, end in connections:
                cv2.line(
                    frame,
                    points[start],
                    points[end],
                    (255, 0, 0),
                    2
                )

        cv2.imshow("ISL Hand Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

finally:
    camera.release()
    landmarker.close()
    cv2.destroyAllWindows()