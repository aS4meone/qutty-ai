'use client';
import React, {useRef, useState} from 'react';
import Webcam from 'react-webcam';
import Link from "next/link";
import Image from 'next/image';
import {GESTURE_IMAGES} from "@/lib/gestures";

const GESTURES = ['dislike', 'like', 'rock', 'ok', 'peace', 'one', 'fist', 'palm'];

const shuffleGestures = (): string[] => {
    return GESTURES.sort(() => 0.5 - Math.random()).slice(0, 3);
};

const ThirdTest: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentGestures, setCurrentGestures] = useState<string[]>([]);
    const [currentGestureIndex, setCurrentGestureIndex] = useState<number | null>(null);
    const [results, setResults] = useState<{ correct_count: number; results: string[] } | null>(null);
    const [showDescription, setShowDescription] = useState(true);

    const startCapture = () => {
        setCapturing(true);
        setShowDescription(false);
        captureSequence();
    };

    const captureSequence = async () => {
        const gestures = shuffleGestures();

        // Show gestures for 5 seconds
        setCurrentGestures(gestures);
        for (let i = 5; i > 0; i--) {
            setCountdown(i);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setCountdown(null);
        setCurrentGestures([]);

        // Capture each gesture in reverse order
        const gestures_reversed = gestures.slice().reverse();
        const images: string[] = [];
        for (let i = 0; i < gestures_reversed.length; i++) {
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
                    console.log(`Captured gesture ${i + 1}: ${gestures_reversed[i]}`);
                }
            }
        }

        setCurrentGestureIndex(null);
        setCapturing(false);
        sendToBackend(gestures_reversed, images);
    };

    const sendToBackend = async (gestures: string[], images: string[]) => {
        const formData = new FormData();
        const storedName = localStorage.getItem("name") || "";
        formData.append('name', storedName)
        formData.append("test_number", "3")
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

        const response = await fetch('http://127.0.0.1:8000/classify-strict-db', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        setResults(result);
    };

    return (
        <div className="text-center pt-5 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800"> Show 3 gestures in reverse order</h1>
            <Webcam ref={webcamRef} screenshotFormat="image/png" className="mx-auto mb-4 rounded-lg shadow-lg"/>
            {showDescription && (
                <div className="text-xl mx-auto p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl">
                    <p>Запомните 3 жеста. Затем покажите их в обратном порядке.
                    </p>
                </div>
            )}
            <button
                onClick={startCapture}
                disabled={capturing}
                className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md ${capturing ? 'hidden' : 'bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]'}`}
            >
                Start
            </button>

            {currentGestures.length > 0 && (
                <div className="flex justify-center mt-6 space-x-4">
                    {currentGestures.map((gesture, index) => (
                        <Image key={index} src={`/gestures/${GESTURE_IMAGES[gesture]}`} alt={gesture}
                               width={120} height={120}/>
                    ))}
                </div>
            )}
            {currentGestureIndex !== null && (
                <div className="text-2xl m-4">
                    Покажите жест {currentGestureIndex + 1}
                </div>
            )}
            {countdown !== null && (
                <div className="text-2xl m-4">
                    Отсчет: {countdown}
                </div>
            )}
            {results && (
                <div className="results mt-6 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl mx-auto">
                    <Link href="test-4"
                          className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]`}
                    >
                        Next
                    </Link>
                    <p className="font-semibold mt-4">Результаты сохранены. Вы можете перейти к следующему тесту.
                        Или вы можете начать тест заново, нажав на кнопку Start выше</p>
                </div>
            )}
        </div>
    );
};

export default ThirdTest;
