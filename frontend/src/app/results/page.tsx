'use client';
import React, {useEffect, useState} from "react";
import Image from "next/image";
import {GESTURE_IMAGES} from "@/lib/gestures";
import Link from "next/link";

interface DataItem {
    id: number;
    name: string;
    diagnosis: string;
    first_test: number;
    second_test: number;
    third_test: number;
    fourth_test: number;
    fifth_test: number;
    sixth_test: number;
}

export default function Results() {
    const [data, setData] = useState<DataItem[]>([]);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch('https://ai-api.qutty.net/', {
                headers: {'Accept': 'application/json'}
            });
            const result: DataItem[] = await response.json();
            setData(result);
        }

        fetchData();
    }, []);

    return (
        <div>
            <header className="px-4 lg:px-6 h-14 flex items-center">
                <Link href="/" className="flex items-center justify-center font-extrabold" prefetch={false}>
                    <span>Dementia Testing</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link href="/" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                        Home
                    </Link>
                    <Link href="/results" className="text-sm font-medium hover:underline underline-offset-4"
                          prefetch={false}>
                        Results
                    </Link>
                </nav>
            </header>
            <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold">Данные</h2>
                    <p className="text-gray-600">Таблица с информацией о пациентах.<br/>Максимальные баллы по тестам указаны в скобках.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Диагноз</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тест
                                1 (8)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тест
                                2 (2)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тест
                                3 (3)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тест
                                4 (6)
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{item.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.diagnosis}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">{item.first_test}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">{item.second_test}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">{item.third_test}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">{item.fourth_test}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
