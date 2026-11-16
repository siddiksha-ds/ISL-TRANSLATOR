import speech_recognition as sr

recognizer = sr.Recognizer()

with sr.Microphone() as source:
    print("Speak something...")
    recognizer.adjust_for_ambient_noise(source, duration=1)
    audio = recognizer.listen(source)

try:
    text = recognizer.recognize_google(audio, language="en-IN")
    print("Recognized text:", text)

except sr.UnknownValueError:
    print("Could not understand audio")

except sr.RequestError:
    print("Speech recognition service unavailable")