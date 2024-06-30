'use client';
import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Link from "next/link";
import Image from "next/image";
import { GESTURE_IMAGES, GESTURES } from "@/lib/gestures";

const shuffleGestures = (): string[] => {
    return GESTURES.sort(() => 0.5 - Math.random()).slice(0, 5);
};

const SecondTest: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentGestures, setCurrentGestures] = useState<string[]>([]);
    const [currentGestureIndex, setCurrentGestureIndex] = useState<number | null>(null);
    const [results, setResults] = useState<{ correct_count: number; results: string[] } | null>(null);
    const [showDescription, setShowDescription] = useState(true);
    const [showWebcam, setShowWebcam] = useState(true);

    const startCapture = async () => {
        setCapturing(true);
        setShowDescription(false);
        setShowWebcam(false);

        const gestures = shuffleGestures();
        setCurrentGestures(gestures);

        for (let i = 0; i < gestures.length; i++) {
            setCurrentGestureIndex(i);
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        setCurrentGestureIndex(null);
        setCurrentGestures([]);
        setShowWebcam(true);
        await captureSequence(gestures);
    };

    const captureSequence = async (gestures: string[]) => {
        const images: string[] = [];

        const captureGesture = async (index: number) => {
            setCurrentGestureIndex(index);
            setCountdown(5);
            for (let i = 5; i > 0; i--) {
                setCountdown(i);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            setCountdown(null);

            if (webcamRef.current) {
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc) {
                    images.push(imageSrc);
                    console.log(`Captured gesture ${index + 1}: ${gestures[index]}`);
                }
            }
        };

        await captureGesture(4); // Gesture 5
        await captureGesture(2); // Gesture 3

        setCurrentGestureIndex(null);
        setCapturing(false);
        sendToBackend([gestures[4], gestures[2]], images);
    };

    const sendToBackend = async (gestures: string[], images: string[]) => {
        const formData = new FormData();
        const storedName = localStorage.getItem("name") || "";
        formData.append('name', storedName);
        formData.append("test_number", "2");
        formData.append('gesture_names', gestures.join(','));

        images.forEach((image, index) => {
            const byteString = atob(image.split(',')[1]);
            const mimeString = image.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
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
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Second Test</h1>
            {showWebcam && (
                <Webcam ref={webcamRef} screenshotFormat="image/png" className="mx-auto mb-4 rounded-lg shadow-lg" />
            )}
            {showDescription && (
                <div className="description mx-auto p-4 bg-white rounded-lg shadow-md text-gray-700 text-xl max-w-xl">
                    <p>Запомните 5 жестов. Затем повторите в любом порядке</p>
                </div>
            )}
            <button
                onClick={startCapture}
                disabled={capturing}
                className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md ${capturing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]'}`}
            >
                Start
            </button>
            {currentGestureIndex !== null && currentGestures.length > 0 && (
                <div style={{ fontSize: '2rem', margin: '1rem' }}>
                    <h2>Жест {currentGestureIndex + 1}</h2>
                    <Image
                        src={`/gestures/${GESTURE_IMAGES[currentGestures[currentGestureIndex]]}`}
                        alt={currentGestures[currentGestureIndex]}
                        width={150}
                        height={150}
                        className="mx-auto"
                    />
                </div>
            )}
            {countdown !== null && (
                <div className="text-4xl mt-6 text-gray-800">
                    Отсчет: {countdown}
                </div>
            )}
            {results && (
                <div className="results mt-6 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl mx-auto">
                    <Link href="test-3"
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

export default SecondTest;
