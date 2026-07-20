import { useState } from "react";
import Cookies from "js-cookie";

import { api } from "../api";

interface Props {
    onClose: () => void;
}

export function CreateUserBox({ onClose }: Props) {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [role, setRole] = useState("USER");

    const [error, setError] = useState("");

    function hasLowercase(pass: string) {
        return /[a-z]/.test(pass);
    }

    async function handleCreate() {

        setError("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedAddress = address.trim();

        if (trimmedName.length < 5) {
            setError("Minimum 5 letters required.");
            return;
        }

        if (trimmedName.length > 60) {
            setError("Maximum 60 letters allowed.");
            return;
        }

        if (trimmedAddress.length === 0) {
            setError("Please enter address.");
            return;
        }

        if (trimmedAddress.length > 200) {
            setError("Address length should be less than 200.");
            return;
        }

        if (
            !trimmedEmail.includes("@gmail.com") ||
            !hasLowercase(trimmedEmail)
        ) {
            setError("Enter valid email.");
            return;
        }

        try {

            const response = await api.post(
                "/create-user",
                {
                    name: trimmedName,
                    email: trimmedEmail,
                    address: trimmedAddress,
                    role
                },
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("token")}`
                    }
                }
            );

            alert(
                `User created successfully!

                Email : ${response.data.user.email}

                Generated Password : ${response.data.generatedPassword}

                Share these credentials with the user.`
            );

            onClose();

        } catch (err: any) {

            if (err.response?.status === 409) {
                setError("User already exists.");
                return;
            }

            setError("Something went wrong.");
        }
    }

    return (

        <div className="bg-white rounded-xl shadow-xl w-[430px] p-6">

            <h2 className="text-2xl font-bold mb-6 text-center">
                Create User
            </h2>

            <div className="space-y-4">

                <input
                    className="w-full border rounded-md p-2"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="w-full border rounded-md p-2"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <textarea
                    className="w-full border rounded-md p-2 resize-none"
                    rows={3}
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <select
                    className="w-full border rounded-md p-2"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="USER">USER</option>
                    <option value="OWNER">OWNER</option>
                </select>

                {error && (
                    <p className="text-red-500 text-sm">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-3">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white"
                    >
                        Create User
                    </button>

                </div>

            </div>

        </div>

    );
}