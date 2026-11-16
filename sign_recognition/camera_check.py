import cv2

camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not camera.isOpened():
    print("ERROR: Camera not opening")
    exit()

print("Camera working! Press Q to close.")

while True:
    success, frame = camera.read()

    if not success:
        print("ERROR: Cannot read camera")
        break

    frame = cv2.flip(frame, 1)

    cv2.imshow("Camera Test", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

camera.release()
cv2.destroyAllWindows()