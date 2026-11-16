import tkinter as tk
from PIL import Image, ImageTk, ImageSequence
from pathlib import Path

signs = {
    "hello": "HELLO.gif",
    "yes": "YES.gif",
    "no": "NO.gif",
    "thank you": "THANK YOU.gif"
}

GIF_FOLDER = Path(__file__).parent / "sign_animations"

root = tk.Tk()
root.title("ISL Avatar Translator")
root.geometry("500x500")

title = tk.Label(
    root,
    text="Text to Indian Sign Language",
    font=("Arial", 18, "bold")
)
title.pack(pady=15)

entry = tk.Entry(root, font=("Arial", 16), width=25)
entry.pack(pady=10)

status = tk.Label(root, text="Enter a phrase", font=("Arial", 13))
status.pack(pady=10)

avatar = tk.Label(root)
avatar.pack(pady=15)

animation_job = None
frames = []
frame_index = 0

def play_frame():
    global frame_index

    if not frames:
        return

    avatar.config(image=frames[frame_index])
    frame_index = (frame_index + 1) % len(frames)

    root.after(100, play_frame)

def translate():
    global frames, frame_index, animation_job

    text = entry.get().lower().strip()

    if text not in signs:
        status.config(text="Sign not available yet!")
        avatar.config(image="")
        return

    gif_path = GIF_FOLDER / signs[text]

    if not gif_path.exists():
        status.config(text=f"GIF not found: {gif_path.name}")
        return

    if animation_job:
        root.after_cancel(animation_job)
        animation_job = None

    gif = Image.open(gif_path)

    frames = [
        ImageTk.PhotoImage(frame.copy().convert("RGBA"))
        for frame in ImageSequence.Iterator(gif)
    ]

    frame_index = 0
    status.config(text="ISL Sign: " + signs[text].replace(".gif", ""))

    play_frame()

button = tk.Button(
    root,
    text="Translate",
    font=("Arial", 14),
    command=translate
)
button.pack(pady=10)

root.mainloop()