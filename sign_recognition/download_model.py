import urllib.request

url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"

print("Starting model download...")

try:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        total = int(response.headers.get("Content-Length", 0))
        downloaded = 0

        with open("hand_landmarker.task", "wb") as file:
            while True:
                chunk = response.read(1024 * 256)

                if not chunk:
                    break

                file.write(chunk)
                downloaded += len(chunk)

                if total:
                    percent = downloaded * 100 / total
                    print(f"Downloaded: {percent:.1f}%", flush=True)

    print("Download finished!")

except Exception as error:
    print("Download failed:", error)