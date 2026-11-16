import cv2
from hand_tracking.landmark_detector import LiveLandmarkDetector

detector = LiveLandmarkDetector(number_of_hands=1)
camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

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

            print("\nHAND OBJECT DETAILS")
            print("-------------------")

            for name, value in vars(hand).items():
                print("\nAttribute:", name)
                print("Type:", type(value))

                if hasattr(value, "shape"):
                    print("Shape:", value.shape)

                print("Value:", value)

            break

        cv2.imshow("Landmark Check", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

finally:
    camera.release()
    detector.landmarker.close()
    cv2.destroyAllWindows()