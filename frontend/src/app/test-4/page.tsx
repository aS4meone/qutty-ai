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

const getRandomShapes = () => {
    const shapesCopy = [...SHAPES];
    return shapesCopy.sort(() => 0.5 - Math.random()).slice(0, 2);
};

const getRandomGestures = () => {
    const gesturesCopy = [...GESTURES];
    return gesturesCopy.sort(() => 0.5 - Math.random()).slice(0, 2);
};

const generateShapeSequence = (selectedShapes: any) => {
    const targetShapes = [...Array(3).fill(selectedShapes[0]), ...Array(3).fill(selectedShapes[1])];
    const fillerShapes = [];
    while (fillerShapes.length < 24) {
        const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        if (!selectedShapes.includes(randomShape)) {
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
    const [shapesGestures, setShapesGestures] = useState<{ [key: string]: string }>({});
    const [showDescription, setShowDescription] = useState(true);
    const [shapeGestureDescription, setShapeGestureDescription] = useState<{
        shape1: string;
        gesture1: string;
        shape2: string;
        gesture2: string
    } | null>(null);

    const startCapture = () => {
        const selectedShapes = getRandomShapes();
        const selectedGestures = getRandomGestures();
        const newShapesGestures: { [key: string]: string } = {};
        selectedShapes.forEach((shape, index) => {
            newShapesGestures[shape] = selectedGestures[index];
        });
        setShapesGestures(newShapesGestures);
        setShapeGestureDescription({
            shape1: selectedShapes[0],
            gesture1: selectedGestures[0],
            shape2: selectedShapes[1],
            gesture2: selectedGestures[1]
        });
        setCapturing(true);
        setShowDescription(false);
        captureSequence(newShapesGestures);
    };

    const captureSequence = async (shapesGestures: { [key: string]: string }) => {
        const images: string[] = [];
        const gestureOrder: string[] = [];
        const allShapes = Object.keys(shapesGestures);
        const shapeSequence = generateShapeSequence(allShapes);
        const shapeCount: { [key: string]: number } = { [allShapes[0]]: 0, [allShapes[1]]: 0 };

        for (let i = 5; i > 0; i--) {
            setCountdown(i);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setCountdown(null);
        setShapeGestureDescription(null);

        for (let i = 0; i < shapeSequence.length; i++) {
            const currentShape = shapeSequence[i];
            setCurrentShape(currentShape);

            if (allShapes.includes(currentShape)) {
                shapeCount[currentShape]++;
                if (shapeCount[currentShape] > 3) {
                    continue;
                }

                for (let j = 2; j > 0; j--) {
                    setCountdown(j);
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
                setCountdown(null);

                if (webcamRef.current) {
                    const imageSrc = webcamRef.current.getScreenshot();
                    if (imageSrc) {
                        images.push(imageSrc);
                        gestureOrder.push(shapesGestures[currentShape]);
                        console.log(`Captured gesture for shape ${currentShape}`);
                    }
                }

                if (shapeCount[allShapes[0]] >= 3 && shapeCount[allShapes[1]] >= 3) {
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

        const response = await fetch('https://ai-api.qutty.net/classify-strict-db', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        setResults(result);
    };

    return (
        <div className="text-center pt-5 min-h-screen">
            <Webcam ref={webcamRef} screenshotFormat="image/png"
                className={`mx-auto mb-4 rounded-lg shadow-lg  ${shapeGestureDescription ? 'hidden' : 'block'}`} />
            {showDescription && (
                <div className="text-xl mx-auto p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl">
                    <p>Запомните 2 жеста, привязанные к фигурам указанного цвета. Показывайте эти жесты, когда вы
                        увидите соотвестующие фигуры на экране.</p>
                </div>
            )}
            <button
                onClick={startCapture}
                disabled={capturing}
                className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md ${capturing ? 'hidden' : 'bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]'}`}
            >
                Start
            </button>

            {shapeGestureDescription && (
                <div className="flex flex-col items-center mt-4">
                    <div className="flex items-center mb-4">
                        <Image src={`/figures/${SHAPE_IMAGES[shapeGestureDescription.shape1]}`}
                            alt={shapeGestureDescription.shape1} width={150} height={150} />
                        <span className="mx-2"> - </span>
                        <Image src={`/gestures/${GESTURE_IMAGES[shapeGestureDescription.gesture1]}`}
                            alt={shapeGestureDescription.gesture1} width={150} height={150} />
                    </div>
                    <div className="flex items-center">
                        <Image src={`/figures/${SHAPE_IMAGES[shapeGestureDescription.shape2]}`}
                            alt={shapeGestureDescription.shape2} width={150} height={150} />
                        <span className="mx-2"> - </span>
                        <Image src={`/gestures/${GESTURE_IMAGES[shapeGestureDescription.gesture2]}`}
                            alt={shapeGestureDescription.gesture2} width={150} height={150} />
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
                <div className="results mt-6 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl mx-auto">
                    <Link href="results"
                          className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]`}
                    >
                        Results
                    </Link>
                    <p className="font-semibold mt-4">Результаты сохранены. Вы можете посмотреть их
                        нажав кнопку Выше</p>
                </div>
            )}
        </div>
    );
};

export default FourthTest;


