'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from "next/link";

const GESTURES = ['dislike', 'like', 'rock', 'ok', 'peace', 'one', 'fist', 'palm'];

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

const getRandomGestures = () => {
    const gesturesCopy = [...GESTURES];
    return gesturesCopy.sort(() => 0.5 - Math.random()).slice(0, 5);
};

const ZeroTest: React.FC = () => {
    const [randomGestures, setRandomGestures] = useState<string[]>([]);
    const [showGestures, setShowGestures] = useState(false);
    const [showDescription, setShowDescription] = useState(true);

    const startDisplayGestures = () => {
        const selectedGestures = getRandomGestures();
        setRandomGestures(selectedGestures);
        setShowGestures(true);
        setShowDescription(false);

        setTimeout(() => {
            setShowGestures(false);
            localStorage.setItem('randomGestures', JSON.stringify(selectedGestures));
        }, 10000);
    };

    return (
        <div className="text-center pt-5 min-h-screen">
            {showDescription && (
                <div className="text-xl mx-auto p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl">
                    <p>Запомните жесты, которые будут показаны. Эти жесты будут использоваться в следующих тестах.</p>
                </div>
            )}
            {!showGestures && (
                <button
                    onClick={startDisplayGestures}
                    className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]`}
                >
                    Start
                </button>
            )}
            {showGestures && (
                <div className="flex flex-wrap justify-center">
                    {randomGestures.map((gesture, index) => (
                        <div key={index} className="m-2">
                            <Image
                                src={`/gestures/${GESTURE_IMAGES[gesture]}`}
                                alt={gesture}
                                width={100}
                                height={100}
                            />
                        </div>
                    ))}
                </div>
            )}
            {!showDescription && !showGestures && (
                <div className="results mt-6 p-4 bg-white rounded-lg shadow-md text-gray-700 max-w-xl mx-auto">
                    <Link href="test-1"
                          className={`px-4 py-2 mt-4 font-semibold rounded-lg shadow-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)]`}
                    >
                        Next
                    </Link>
                    <p className="font-semibold mt-4">Жесты сохранены. Вы можете перейти к первому тесту.
                        Или вы можете заново загрузить жесты, перезагрузив страницу.</p>
                </div>
            )}
        </div>
    );
};

export default ZeroTest;
