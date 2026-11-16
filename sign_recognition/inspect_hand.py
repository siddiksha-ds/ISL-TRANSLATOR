import cv2
from hand_tracking.landmark_detector import LiveLandmarkDetector

detector = LiveLandmarkDetector(number_of_hands=2)
camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

print("Starting inspection...")

try:
    while True:
        success, frame = camera.read()

        if not success:
            print("Camera error")
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        detector.process_frame(rgb)
        latest_frame, hands = detector.get_latest_data()

        if hands:
            hand = hands[0]

            print("\nHAND DETECTED!")
            print("Type:", type(hand))
            print("Attributes:")
            print(dir(hand))

            for attribute in dir(hand):
                if not attribute.startswith("_"):
                    try:
                        value = getattr(hand, attribute)
                        if not callable(value):
                            print(attribute, "=", value)
                    except Exception as error:
                        print(attribute, "could not be read:", error)

            break

        cv2.imshow("Inspection", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

finally:
    camera.release()
    detector.landmarker.close()
    cv2.destroyAllWindows()