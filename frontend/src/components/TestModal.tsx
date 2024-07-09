import React, {useEffect, FC, useState} from "react";
import {useRouter} from "next/navigation";

interface TestModalProps {
    onClose: () => void;
}

const TestModal: FC<TestModalProps> = ({onClose}) => {
    const [name, setName] = useState("");
    const [moca, setMoca] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [validationMessage, setValidationMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const handleContentClick = (event: React.MouseEvent) => {
        event.stopPropagation();
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!name || !moca) {
            setValidationMessage("Please fill in all fields.");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("moca", moca);
        formData.append("gender", gender);
        formData.append("age", age);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/diagnosis`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                localStorage.setItem("name", name);
                router.push("/test-1");
            } else {
                console.error("Error submitting the form");
            }
        } catch (error) {
            console.error("Error submitting the form", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <form className="w-full max-w-lg p-6 bg-[hsl(210_100%_97%)] shadow-lg rounded-xl"
                  onClick={handleContentClick} onSubmit={handleSubmit}>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Patient Information</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center">
                        <label htmlFor="name" className="w-1/4 text-right mr-4">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (validationMessage) setValidationMessage("");
                            }}
                            placeholder="Enter patient name"
                            className="w-3/4 px-4 py-2 border rounded-2xl border-blue-200 bg-[hsl(210_100%_98%)]"
                        />
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="gender" className="w-1/4 text-right mr-4">
                            Gender
                        </label>
                        <select
                            id="gender"
                            value={gender}
                            onChange={(e) => {
                                setGender(e.target.value);
                                if (validationMessage) setValidationMessage("");
                            }}
                            className="w-3/4 px-4 py-2 border rounded-2xl border-blue-200 bg-[hsl(210_100%_98%)]"
                        >
                            <option value="" disabled>Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="age" className="w-1/4 text-right mr-4">
                            Age
                        </label>
                        <input
                            id="age"
                            type="text"
                            value={age}
                            onChange={(e) => {
                                setAge(e.target.value);
                                if (validationMessage) setValidationMessage("");
                            }}
                            placeholder="Enter patients age"
                            className="w-3/4 px-4 py-2 border rounded-2xl border-blue-200 bg-[hsl(210_100%_98%)]"
                        />
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="moca" className="w-1/4 text-right mr-4">
                            Moca Test
                        </label>
                        <input
                            id="moca"
                            type="text"
                            value={moca}
                            onChange={(e) => {
                                setMoca(e.target.value);
                                if (validationMessage) setValidationMessage("");
                            }}
                            placeholder="Enter moca test score"
                            className="w-3/4 px-4 py-2 border rounded-2xl border-blue-200 bg-[hsl(210_100%_98%)]"
                        />
                    </div>
                </div>
                {validationMessage && (
                    <div className="mt-4 text-red-500 text-center">
                        {validationMessage}
                    </div>
                )}
                <div className="mt-6 flex justify-center">
                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-semibold bg-[hsl(308_56%_85%)] text-[hsl(210_22%_22%)] rounded hover:bg-[hsl(308_56%_75%)]"
                    >
                        Start the Test
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TestModal;
