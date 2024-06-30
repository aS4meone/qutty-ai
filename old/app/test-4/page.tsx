'use client';
import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Link from "next/link";
import Image from 'next/image';

const GESTURES = ['dislike', 'like', 'rock', 'ok', 'peace', 'one', 'fist', 'palm'];

const SHAPES = ['black_circle', 'black_square', 'black_star', 'black_triangle', 'white_circle', 'white_square', 'white_star', "white_triangle"];

const GESTURE_IMAGES: { [key: string]: string } = {
    dislike: 'dislike.png',
    like: 'like.png',
    rock: 'rock.png',
    ok: 'ok.png',
    peace: 'peace.png',
    one: 'one.png',
    fist: 'fist.png',
    palm: 'palm.png',
};

const SHAPE_IMAGES: { [key: string]: string } = {
    black_circle: 'black_circle.png',
    black_square: 'black_square.png',
    black_star: 'black_star.png',
    black_triangle: 'black_triangle.png',
    white_circle: 'white_circle.png',
    white_square: 'white_square.png',
    white_star: 'white_star.png',
    white_triangle: 'white_triangle.png',
};

const getRandomShape = () => {
    return SHAPES[Math.floor(Math.random() * SHAPES.length)];
};

const getRandomGesture = () => {
    return GESTURES[Math.floor(Math.random() * GESTURES.length)];
};

const generateShapeSequence = (selectedShape: string) => {
    const targetShapes = [...Array(3).fill(selectedShape)];
    const fillerShapes = [];
    while (fillerShapes.length < 27) {
        const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        if (randomShape !== selectedShape) {
            fillerShapes.push(randomShape);
        }
    }
    const combinedShapes = [...targetShapes, ...fillerShapes];
    for (let i = combinedShapes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combinedShapes[i], combinedShapes[j]] = [combinedShapes[j], combinedShapes[i]];
    }
    return combinedShapes;
};

const FourthTest: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentShape, setCurrentShape] = useState<string | null>(null);
    const [results, setResults] = useState<{ correct_count: number; results: string[] } | null>(null);
    const [shapeGesture, setShapeGesture] = useState<{ shape: string, gesture: string } | null>(null);
    const [showDescription, setShowDescription] = useState(true);

    const startCapture = () => {
        const selectedShape = getRandomShape();
        const selectedGesture = getRandomGesture();
        setShapeGesture({ shape: selectedShape, gesture: selectedGesture });
        setCapturing(true);
        setShowDescription(false);
        captureSequence({ shape: selectedShape, gesture: selectedGesture });
    };

    const captureSequence = async (shapeGesture: { shape: string, gesture: string }) => {
        const images: string[] = [];
        const gestureOrder: string[] = [];
        const shapeSequence = generateShapeSequence(shapeGesture.shape);

        for (let i = 5; i > 0; i--) {
            setCountdown(i);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setCountdown(null);
        setShapeGesture(null);

        let targetShapeCount = 0;

        for (let i = 0; i < shapeSequence.length; i++) {
            const currentShape = shapeSequence[i];
            setCurrentShape(currentShape);

            if (currentShape === shapeGesture.shape) {
                targetShapeCount++;
                for (let j = 2; j > 0; j--) {
                    setCountdown(j);
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
                setCountdown(null);

                if (webcamRef.current) {
                    const imageSrc = webcamRef.current.getScreenshot();
                    if (imageSrc) {
                        images.push(imageSrc);
                        gestureOrder.push(shapeGesture.gesture);
                        console.log(`Captured gesture for shape ${currentShape}`);
                    }
                }

                if (targetShapeCount === 3) {
                    break;
                }
            } else {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }
        }

        setCurrentShape(null);
        setCapturing(false);
        sendToBackend(gestureOrder, images);
    };

    const sendToBackend = async (gestureOrder: string[], images: string[]) => {
        const formData = new FormData();
        const storedName = localStorage.getItem("name") || "";
        formData.append('name', storedName);
        formData.append("test_number", "4");
        formData.append('gesture_names', gestureOrder.join(','));

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

        const response = await fetch('http://127.0.0.1:8000/classify-strict-db', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        setResults(result);
    };

    return (
        <div className="text-center pt-5 min-h-screen">
            <Webcam ref={webcamRef} screenshotFormat="image/png"
                    className={`mx-auto mb-4 rounded-lg shadow-lg  ${shapeGesture ? 'hidden' : 'block'}`} />
            {showDescription && (
                <div className="text-xl mx-auto p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl">
                    <p>Запомните жест, привязанный к фигуре указанного цвета. Показывайте этот жест, когда вы увидите соответствующую фигуру на экране.</p>
                </div>
            )}
            <button
                onClick={startCapture}
                disabled={capturing}
                className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md ${capturing ? 'hidden' : 'bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]'}`}
            >
                Start
            </button>

            {shapeGesture && (
                <div className="flex flex-col items-center mt-4">
                    <div className="flex items-center">
                        <Image src={`/figures/${SHAPE_IMAGES[shapeGesture.shape]}`}
                               alt={shapeGesture.shape} width={150} height={150} />
                        <span className="mx-2"> - </span>
                        <Image src={`/gestures/${GESTURE_IMAGES[shapeGesture.gesture]}`}
                               alt={shapeGesture.gesture} width={150} height={150} />
                    </div>
                </div>
            )}

            {currentShape && (
                <div style={{ fontSize: '2rem', margin: '1rem' }}>
                    <Image
                        src={`/figures/${SHAPE_IMAGES[currentShape]}`}
                        alt={currentShape}
                        width={150}
                        height={150}
                        className="mx-auto"
                    />
                </div>
            )}
            {results && (
                <div
                    className="results mt-6 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl mx-auto">
                    <Link href="test-5"
                          className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]`}
                    >
                        Next
                    </Link>
                    <p className="font-semibold mt-4">Результаты сохранены. Вы можете перейти к следующему
                        тесту.
                        Или вы можете начать тест заново, нажав на кнопку Start выше</p>
                </div>
            )}
        </div>
    );
};

export default FourthTest;
