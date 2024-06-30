'use client';
import React, {useRef, useState} from 'react';
import Webcam from 'react-webcam';
import Link from "next/link";

const SixthTest: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentGestureIndex, setCurrentGestureIndex] = useState<number | null>(null);
    const [results, setResults] = useState<{ correct_count: number; results: string[] } | null>(null);
    const [showDescription, setShowDescription] = useState(true);

    const startCapture = () => {
        setCapturing(true);
        setShowDescription(false);
        captureSequence();
    };

    const captureSequence = async () => {
        const gestures = JSON.parse(localStorage.getItem('randomGestures') || '[]');

        // Capture each gesture
        const images: string[] = [];
        for (let i = 0; i < gestures.length; i++) {
            setCurrentGestureIndex(i);
            for (let j = 3; j > 0; j--) {
                setCountdown(j);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            setCountdown(null);

            if (webcamRef.current) {
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc) {
                    images.push(imageSrc);
                    console.log(`Captured gesture ${i + 1}`);
                }
            }
        }

        setCurrentGestureIndex(null);
        setCapturing(false);
        sendToBackend(gestures, images);
    };

    const sendToBackend = async (gestures: string[], images: string[]) => {
        const formData = new FormData();
        const storedName = localStorage.getItem("name") || "";
        formData.append('name', storedName);
        formData.append("test_number", "6");
        formData.append('gesture_names', gestures.join(','));

        images.forEach((image, index) => {
            const byteString = atob(image.split(',')[1]);
            const mimeString = image.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], {type: mimeString});
            formData.append('images', blob, `image${index}.png`);
        });

        const response = await fetch('http://127.0.0.1:8000/classify-not-strict-db', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        setResults(result);
    };

    return (
        <div className="text-center pt-5 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Sixth Test</h1>
            <Webcam ref={webcamRef} screenshotFormat="image/png" className="mx-auto mb-4 rounded-lg shadow-lg"/>
            {showDescription && (
                <div className="description mx-auto p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl">
                    <p>В этом тесте вам нужно показать 5 жестов, которые вы запомнили ранее.</p>
                </div>
            )}
            <button
                onClick={startCapture}
                disabled={capturing}
                className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md ${capturing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]'}`}
            >
                Start
            </button>
            {currentGestureIndex !== null && (
                <div style={{fontSize: '2rem', margin: '1rem'}}>
                    Покажите жест {currentGestureIndex + 1}
                </div>
            )}
            {countdown !== null && (
                <div className="text-4xl mt-6 text-gray-800">
                    Отсчет: {countdown}
                </div>
            )}
            {results && (
                <div className="results mt-6 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl mx-auto">
                    <Link href="results"
                          className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]`}
                    >
                        Results
                    </Link>
                    <p className="font-semibold mt-4">Результаты сохранены. Вы можете перейти к следующему тесту.
                        Или вы можете начать тест заново, нажав на кнопку Start выше</p>
                </div>
            )}
        </div>
    );
};

export default SixthTest;
