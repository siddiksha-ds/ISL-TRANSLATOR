import pyttsx3

engine = pyttsx3.init()

engine.setProperty("rate", 150)
engine.setProperty("volume", 1.0)

engine.say("Hello! Indian Sign Language translation is working.")
engine.runAndWait()
engine = pyttsx3.init()
engine.setProperty("rate", 150)
engine.setProperty("volume", 1.0)

last_prediction = None