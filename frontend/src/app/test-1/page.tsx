'use client';
import React, {useRef, useState} from 'react';
import Webcam from 'react-webcam';
import Link from "next/link";
import Image from 'next/image'
import {GESTURE_IMAGES, shuffleGestures} from "@/lib/gestures";

const FirstTest: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentGesture, setCurrentGesture] = useState<string | null>(null);
    const [results, setResults] = useState<{ correct_count: number; results: string[] } | null>(null);
    const [showDescription, setShowDescription] = useState(true);

    const startCapture = () => {
        setCapturing(true);
        setShowDescription(false);
        captureSequence();
    };

    const captureSequence = async () => {
        const gestures = shuffleGestures();
        const images: string[] = [];

        for (const gesture of gestures) {
            setCurrentGesture(gesture);

            for (let i = 3; i > 0; i--) {
                setCountdown(i);
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            setCountdown(null);

            if (webcamRef.current) {
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc) {
                    images.push(imageSrc);
                    console.log(`Captured ${gesture}`);
                }
            }
        }
        setCurrentGesture(null);
        setCapturing(false);
        sendToBackend(gestures, images);
    };

    const sendToBackend = async (gestures: string[], images: string[]) => {
        const formData = new FormData();
        const storedName = localStorage.getItem("name") || "";
        formData.append('name', storedName);
        formData.append("test_number", "1");
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

        const response = await fetch('https://ai-api.qutty.net/classify-strict-db', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        setResults(result);
    };

    return (
        <div className="text-center pt-5 min-h-screen">
            <Webcam ref={webcamRef} screenshotFormat="image/png" className="mx-auto mb-4 rounded-lg shadow-lg"/>
            {showDescription && (
                <div className="text-xl mx-auto p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl">
                    <p>Повторяйте жесты, которые вы увидите на экране.</p>
                </div>
            )}
            <button
                onClick={startCapture}
                disabled={capturing}
                className={`px-4 py-2 mt-3 font-semibold rounded-lg shadow-md ${capturing ? 'bg-gray-400 cursor-not-allowed hidden' : 'bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]'}`}
            >
                Start
            </button>
            {currentGesture && (
                <div className="text-2xl mt-4 text-gray-800">
                    <Image src={`/gestures/${GESTURE_IMAGES[currentGesture]}`} alt={currentGesture} width="150" height="150"
                           className="mx-auto"/>
                </div>
            )}
            {countdown !== null && (
                <div className="text-4xl mt-6 text-gray-800">
                    Отсчет: {countdown}
                </div>
            )}
            {results && (
                <div className="results mt-6 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl mx-auto">
                    <Link href="test-2"
                          className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md ${capturing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]'}`}
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

export default FirstTest;
