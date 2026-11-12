import cv2
from hand_tracking.landmark_detector import LiveLandmarkDetector

# Initialize hand detector
detector = LiveLandmarkDetector(number_of_hands=2)

# Use DirectShow webcam backend
camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not camera.isOpened():
    print("Cannot access webcam")
    detector.landmarker.close()
    exit()

print("Finger analysis started!")
print("Press Q to quit.")

try:
    while True:
        success, frame = camera.read()

        if not success:
            print("Cannot read webcam")
            break

        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        detector.process_frame(rgb_frame)
        latest_frame, hands = detector.get_latest_data()

        if latest_frame is not None:
            output = detector.draw_landmarks_from_hands(
                latest_frame.copy(), hands
            )

            if hands:
                for i, hand in enumerate(hands):
                    raised = hand.get_raised_fingers()
                    finger_text = ", ".join(raised) if raised else "None"

                    message = f"{hand.side}: {finger_text}"

                    cv2.putText(
                        output,
                        message,
                        (20, 40 + i * 40),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.7,
                        (0, 255, 0),
                        2
                    )
            else:
                cv2.putText(
                    output,
                    "Show your hand",
                    (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 0, 255),
                    2
                )

            cv2.imshow("ISL Finger Analysis", output)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

finally:
    camera.release()
    detector.landmarker.close()
    cv2.destroyAllWindows()