import cv2

# Access laptop webcam
camera = cv2.VideoCapture(0)

# Check camera connection
if not camera.isOpened():
    print("Error: Cannot access webcam")
    exit()

print("Webcam started successfully!")
print("Press Q to close the camera.")

while True:

    # Capture frame
    success, frame = camera.read()

    if not success:
        print("Unable to capture frame")
        break

    # Mirror the video
    frame = cv2.flip(frame, 1)

    # Display project name
    cv2.putText(
        frame,
        "ISL Translator",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    # Show webcam
    cv2.imshow("ISL Webcam Test", frame)

    # Press Q to exit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release camera
camera.release()
cv2.destroyAllWindows()