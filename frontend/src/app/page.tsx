'use client';
import Link from "next/link";
import React, {SVGProps, useState} from "react";
import TestModal from "@/components/TestModal";

export default function MainPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="flex flex-col min-h-screen text-[hsl(339_20%_20%)]">
            <header className="px-4 lg:px-6 h-14 flex items-center">
                <Link href="/" className="flex items-center justify-center font-extrabold" prefetch={false}>
                    <span>ai.qutty.net</span>
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
            <main className="flex-1 flex items-center justify-center">
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
                    <div className="container mx-auto px-4 md:px-6 text-center">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                Dementia Testing Made Easy <br/>with Qutty
                            </h1>
                            <p className="mx-auto max-w-[700px] text-[hsl(210_22%_22%)] md:text-xl">
                                Our online dementia assessment helps you identify potential cognitive issues faster and
                                earlier. Get started with a simple test today.
                            </p>
                            <button
                                onClick={openModal}
                                className="inline-flex h-10 items-center justify-center rounded-md bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)] px-8 text-sm font-medium shadow transition-colors hover:bg-[hsl(308_56%_75%)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(210_40%_60%)] disabled:pointer-events-none disabled:opacity-50 lg:w-1/4 md:w-1/2"
                            >
                                Start Test
                            </button>
                        </div>
                    </div>
                </section>
            </main>
            <footer
                className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-[hsl(210_40%_80%)]">
                <p className="text-xs text-[hsl(210_22%_22%)]">All rights reserved. &copy; ai.qutty.net 2024</p>
            </footer>
            {isModalOpen && <TestModal onClose={closeModal}/>}
        </div>
    );
}

function BrainIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
            <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
            <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
            <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
            <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
            <path d="M6 18a4 4 0 0 1-1.967-.516"/>
            <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
        </svg>
    );
}
