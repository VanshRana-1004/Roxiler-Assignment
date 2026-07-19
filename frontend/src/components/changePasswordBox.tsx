import { useState } from "react";
import Cookies from "js-cookie";
import { api } from "../api";

interface Props {
    onClose: () => void;
}

export function ChangePasswordBox({ onClose }: Props) {

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    function hasUppercase(pass: string) {
        return /[A-Z]/.test(pass);
    }

    function hasSpecial(pass: string) {
        return /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    }

    async function changePassword() {

        const trimmedPassword = password.trim();

        if (trimmedPassword.length < 8 || trimmedPassword.length > 16) {
            setError("Password should be between 8 and 16 characters.");
            return;
        }

        if (
            !hasUppercase(trimmedPassword) ||
            !hasSpecial(trimmedPassword)
        ) {
            setError(
                "Password must contain at least one uppercase letter and one special character."
            );
            return;
        }

        if (trimmedPassword !== confirmPassword.trim()) {
            setError("Passwords do not match.");
            return;
        }

        try {

            await api.post(
                "/update-password",
                {
                    password: trimmedPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("token")}`,
                    },
                }
            );

            alert("Password changed successfully.");
            onClose();

        } catch {
            setError("Unable to change password.");
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

            <div className="bg-white rounded-xl shadow-xl w-[400px] p-6">

                <h2 className="text-2xl font-bold mb-5">
                    Change Password
                </h2>

                {error && (
                    <p className="text-red-500 text-sm mb-3">
                        {error}
                    </p>
                )}

                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded-md w-full p-2 mb-4"
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border rounded-md w-full p-2 mb-6"
                />

                <div className="flex justify-end gap-3">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={changePassword}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                        Save
                    </button>

                </div>

            </div>

        </div>
    );
}