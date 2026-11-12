import cv2
import csv
import os
import numpy as np
from hand_tracking.landmark_detector import LiveLandmarkDetector

os.makedirs("dataset", exist_ok=True)
CSV_FILE = os.path.abspath("dataset/isl_dataset.csv")

label = input("Enter sign label: ").strip().upper()

if not label:
    print("Invalid label")
    raise SystemExit

detector = LiveLandmarkDetector(number_of_hands=1)
camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not camera.isOpened():
    print("Camera not available")
    detector.landmarker.close()
    raise SystemExit

saved = 0
print("Camera started. Show your hand.")
print("Press Q in the camera window to stop.")

try:
    while True:
        success, frame = camera.read()

        if not success:
            print("Frame not received")
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        detector.process_frame(rgb)
        latest_frame, hands = detector.get_latest_data()

        display = frame.copy()

        if hands:
            hand = hands[0]

            points = [hand.wrist]

            for finger in ["thumb", "index", "middle", "ring", "pinky"]:
                points.extend(hand.fingers[finger])

            landmarks = np.asarray(points, dtype=np.float32)

            print("Detected landmark shape:", landmarks.shape)

            if landmarks.shape == (21, 3):
                row = [label] + landmarks.flatten().tolist()

                try:
                    with open(CSV_FILE, "a", newline="") as file:
                        csv.writer(file).writerow(row)

                    saved += 1
                    print("SAVED:", saved)

                except Exception as error:
                    print("CSV ERROR:", error)

                cv2.putText(
                    display, "HAND DETECTED - SAVING",
                    (10, 35), cv2.FONT_HERSHEY_SIMPLEX,
                    0.7, (0, 255, 0), 2
                )
            else:
                print("Incorrect landmark shape:", landmarks.shape)

        else:
            cv2.putText(
                display, "SHOW YOUR HAND",
                (10, 35), cv2.FONT_HERSHEY_SIMPLEX,
                0.7, (0, 0, 255), 2
            )

        cv2.putText(
            display, f"Saved: {saved}",
            (10, 75), cv2.FONT_HERSHEY_SIMPLEX,
            0.7, (255, 255, 0), 2
        )

        cv2.imshow("ISL Data Collection", display)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

finally:
    camera.release()
    detector.landmarker.close()
    cv2.destroyAllWindows()

print("Collection finished.")
print("Total saved:", saved)
print("CSV location:", CSV_FILE)