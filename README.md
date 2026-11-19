\# ISL Connect – AI-Powered Two-Way Indian Sign Language Communication System



\## 1. Project Overview



ISL Connect is an AI-powered prototype designed to reduce communication barriers between Deaf and hearing individuals using Indian Sign Language (ISL).



The system supports two communication directions:



\- \*\*Sign-to-Text:\*\* Recognizes selected ISL signs through a webcam and displays corresponding text.

\- \*\*Text-to-Sign:\*\* Accepts text input and presents sign animations through a 3D avatar.



\## 2. Key Features



\- Webcam-based sign recognition.

\- Hand landmark detection using MediaPipe.

\- Machine learning-based sign classification.

\- FastAPI prediction service.

\- React-based user interface.

\- AI-assisted text translation using Google Gemini.

\- 3D avatar sign animations.



\## 3. Technology Stack



| Component | Technology |

|---|---|

| Programming | Python, JavaScript, TypeScript |

| Computer Vision | OpenCV |

| Landmark Detection | MediaPipe |

| Machine Learning | Scikit-learn, Random Forest |

| Backend | FastAPI |

| Frontend | React, Vite |

| Avatar | Three.js |

| Server | Node.js, Express |

| AI Translation | Google Gemini API |



\## 4. Project Architecture



\### Sign-to-Text



1\. User performs a sign in front of the webcam.

2\. OpenCV captures the webcam image.

3\. MediaPipe extracts hand landmarks.

4\. The trained ML model predicts the sign.

5\. FastAPI returns the prediction.

6\. React displays the recognized text.



\### Text-to-Sign



1\. User enters a text phrase.

2\. The application processes the phrase using the AI translation service.

3\. The application maps the phrase to available sign animations.

4\. A 3D avatar presents the corresponding animation.



\## 5. Project Structure



```text

ISL-TRANSLATOR/

├── avatar-member4/

│   ├── src/

│   ├── server.ts

│   └── .env.example

├── backend/

│   ├── main.py

│   └── requirements.txt

├── frontend/

│   └── src/

├── sign\_recognition/

│   ├── dataset/

│   ├── models/

│   ├── live\_recognition.py

│   └── hand\_landmarker.task

└── README.md

```



\## 6. Installation and Execution



\### Prerequisites



\- Python 3

\- Node.js and npm

\- Git

\- Webcam

\- Gemini API key for avatar translation



\### Clone the repository



```bash

git clone https://github.com/siddiksha-ds/ISL-TRANSLATOR.git

cd ISL-TRANSLATOR

```



\### Start the backend



```powershell

cd backend

python -m venv venv

.\\venv\\Scripts\\Activate.ps1

pip install -r requirements.txt

python -m uvicorn main:app --reload --port 8000

```



API documentation: http://127.0.0.1:8000/docs



\### Start the frontend



Open another terminal:



```powershell

cd frontend

npm install

npm run dev

```



Frontend: http://localhost:5173



\### Start the avatar application



Open another terminal:



```powershell

cd avatar-member4

npm install

npm run dev

```



Configure the Gemini API key in a local `.env` file using `.env.example` as a reference.



\## 7. Testing Results



| Test Case | Result |

|---|---|

| Webcam access | Passed |

| MediaPipe landmark detection | Passed |

| Dataset collection | Completed |

| ML model training and saving | Passed |

| Selected sign prediction | Tested |

| FastAPI server startup | Passed |

| Frontend startup | Passed |

| Frontend-backend prediction | Tested |

| Avatar application startup | Passed |

| Text translation and avatar animation | Tested separately |

| GitHub integration | Passed |

| Seamless two-way operation in one interface | Not yet verified |



\## 8. Limitations



\- The model recognizes only a limited vocabulary of trained signs.

\- It is not a complete continuous ISL recognition system.

\- Recognition may vary with lighting, camera quality, hand position, and background.

\- The current prototype focuses primarily on hand landmarks.

\- Facial expressions and complete body-language interpretation are not fully implemented.

\- Text-to-sign output depends on available translation and animation mappings.

\- Seamless operation of both directions in one interface remains to be verified.

\- Further evaluation with larger datasets and diverse users is necessary.



\## 9. Security



\- Store API credentials in local environment variables.

\- Never upload actual `.env` files or API keys to GitHub.

\- Use `.env.example` with placeholder values only.



\## 10. Future Enhancements



\- Expand the ISL vocabulary.

\- Implement continuous sign recognition.

\- Include facial expressions and body movements.

\- Improve recognition accuracy.

\- Add support for more Indian languages.

\- Expand the 3D avatar sign vocabulary.

\- Complete seamless integration of both communication directions.

\- Conduct broader user testing.



\## 11. Conclusion



ISL Connect demonstrates how computer vision, machine learning, AI-assisted translation, and 3D animation can support communication between Deaf and hearing individuals.



The prototype establishes a foundation for a two-way Indian Sign Language communication system. Further development and testing can improve its vocabulary, reliability, accessibility, and practical usability.



\## Repository



https://github.com/siddiksha-ds/ISL-TRANSLATOR



