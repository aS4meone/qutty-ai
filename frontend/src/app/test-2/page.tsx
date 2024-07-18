'use client';
import React, {useRef, useState} from 'react';
import Webcam from 'react-webcam';
import Link from "next/link";
import Image from 'next/image';
import {GESTURE_IMAGES, SHAPE_IMAGES} from "@/lib/gestures";

const GESTURES = ['dislike', 'like', 'rock', 'ok', 'peace', 'one', 'fist', 'palm'];

const SHAPES = ['black_circle', 'black_square', 'black_star', 'black_triangle', 'white_circle', 'white_square', 'white_star', "white_triangle"];

const getRandomShape = () => {
    return SHAPES[Math.floor(Math.random() * SHAPES.length)];
};

const getRandomGesture = () => {
    return GESTURES[Math.floor(Math.random() * GESTURES.length)];
};

const generateShapeSequence = (selectedShape: string) => {
    const sequence: string[] = [];
    const addRandomShapes = (count: any) => {
        for (let i = 0; i < count; i++) {
            let randomShape;
            do {
                randomShape = getRandomShape();
            } while (randomShape === selectedShape || (sequence.length > 0 && randomShape === sequence[sequence.length - 1]));
            sequence.push(randomShape);
        }
    };

    // Pattern: 3 incorrect, 1 correct, 2 incorrect, 1 correct, 3 incorrect, 1 correct
    addRandomShapes(3);
    sequence.push(selectedShape);
    addRandomShapes(2);
    sequence.push(selectedShape);
    addRandomShapes(3);
    sequence.push(selectedShape);

    return sequence;
};

const SecondTest: React.FC = () => {
    const webcamRef = useRef<Webcam>(null);
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentShape, setCurrentShape] = useState<string | null>(null);
    const [results, setResults] = useState<{ correct_count: number; results: string[] } | null>(null);
    const [shapeGesture, setShapeGesture] = useState<{ shape: string, gesture: string } | null>(null);
    const [showDescription, setShowDescription] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showInstruction, setShowInstruction] = useState(false);

    const startCapture = () => {
        const selectedShape = getRandomShape();
        const selectedGesture = getRandomGesture();
        setShapeGesture({shape: selectedShape, gesture: selectedGesture});
        setCapturing(true);
        setShowDescription(false);
        captureSequence({shape: selectedShape, gesture: selectedGesture});
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
                for (let j = 2; j >= 0; j--) {
                    setCountdown(j === 0 ? null : j);
                    if (webcamRef.current) {
                        const imageSrc = webcamRef.current.getScreenshot();
                        if (imageSrc) {
                            images.push(imageSrc);
                            gestureOrder.push(shapeGesture.gesture);
                            console.log(`Captured gesture for shape ${currentShape}, countdown: ${j}`);
                        }
                    }
                    await new Promise((resolve) => setTimeout(resolve, 1000));
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
        setLoading(true); // Enable loader
        const formData = new FormData();
        const storedName = localStorage.getItem("name") || "";
        formData.append('name', storedName);
        formData.append("test_number", "2");
        formData.append('gesture_names', gestureOrder.join(','));

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

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/classify-strict-db-1`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        setResults(result);
        setLoading(false);

    };

    return (
        <div className="text-center pt-5 min-h-screen">
            {showInstruction ? (
                <>
                    <div className="flex justify-center">
                        <Image src={`/gifs/third.gif`} alt={`pizda`} width={400} height={400} className="center"/>
                    </div>
                    <button
                        onClick={() => setShowInstruction(false)}
                        className="px-4 py-2 mt-3 font-semibold rounded-lg shadow-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]"
                    >
                        Закрыть инструкцию
                    </button>
                </>
            ) : (
                <>
                    <Webcam ref={webcamRef} screenshotFormat="image/png"
                            className={`mx-auto mb-4 rounded-lg shadow-lg  ${shapeGesture ? 'hidden' : 'block'}`}/>
                    {showDescription && (
                        <div className="text-xl mx-auto p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl">
                            <p>Запомните жест, привязанный к фигуре указанного цвета. Показывайте этот жест, когда вы
                                увидите
                                соответствующую фигуру на экране.</p>
                        </div>
                    )}
                    <button
                        onClick={startCapture}
                        disabled={capturing}
                        className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md ${capturing ? 'hidden' : 'bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]'}`}
                    >
                        Start
                    </button>
                    <br/>
                    <button
                        onClick={() => setShowInstruction(true)}
                        className={`px-4 py-2 mt-3 font-semibold rounded-lg shadow-md ${capturing ? 'bg-gray-400 cursor-not-allowed hidden' : 'bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]'}`}
                    >
                        Инструкция
                    </button>

                    {shapeGesture && (
                        <div className="flex flex-col items-center mt-4">
                            <div className="flex items-center">
                                <Image src={`/figures/${SHAPE_IMAGES[shapeGesture.shape]}`}
                                       alt={shapeGesture.shape} width={200} height={200}/>
                                <span className="mx-2"> - </span>
                                <Image src={`/gestures/${GESTURE_IMAGES[shapeGesture.gesture]}`}
                                       alt={shapeGesture.gesture} width={200} height={200}/>
                            </div>
                        </div>
                    )}

                    {currentShape && (
                        <div style={{fontSize: '2rem', margin: '1rem'}}>
                            <Image
                                src={`/figures/${SHAPE_IMAGES[currentShape]}`}
                                alt={currentShape}
                                width={150}
                                height={150}
                                className="mx-auto"
                            />
                        </div>
                    )}
                    {loading && (
                        <div className="text-4xl mt-6 text-gray-800">
                            <p>Loading...</p>
                        </div>
                    )}
                    {results && (
                        <div
                            className="results mt-6 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl mx-auto">
                            <Link href="test-3"
                                  className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]`}
                            >
                                Next
                            </Link>
                            <p className="font-semibold mt-4">Результаты сохранены. Вы можете перейти к следующему
                                тесту.
                                Или вы можете начать тест заново, нажав на кнопку Start выше</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SecondTest;
