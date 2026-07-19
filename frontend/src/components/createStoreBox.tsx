import { useState, useEffect } from "react";
import Cookies from "js-cookie";

import { api } from "../api";

interface Props {
    onClose: () => void;
}

export function CreateStoreBox({ onClose }: Props) {

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [ownerId, setOwnerId] = useState<string>("");

    const [owners, setOwners] = useState<any[]>([]);

    const [error, setError] = useState<string>("");

    function hasLowercase(text: string) {
        return /[a-z]/.test(text);
    }

    useEffect(() => {
        async function getOwners() {
            try {
                const result = await api.get("/available-owners", {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("token")}`
                    }
                });

                setOwners(result.data.owners);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load owners");
            }
        }

        getOwners();
    }, []);
    
    async function handleCreate() {

        setError("");

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedAddress = address.trim();
        const trimmedOwner = ownerId.trim();

        if (trimmedName.length < 3 || trimmedName.length > 60) {
            setError("Store name should be between 3 and 60 characters.");
            return;
        }

        if (!trimmedEmail.includes("@gmail.com") || !hasLowercase(trimmedEmail)) {
            setError("Enter valid email.");
            return;
        }

        if (trimmedAddress.length === 0 || trimmedAddress.length > 200) {
            setError("Enter valid address.");
            return;
        }

        if (trimmedOwner === "") {
            setError("Owner Id is required.");
            return;
        }

        try {

            await api.post(
                "/create-store",
                {
                    name: trimmedName,
                    email: trimmedEmail,
                    address: trimmedAddress,
                    ownerId: trimmedOwner
                },
                {
                    headers: {
                        Authorization: `Bearer ${Cookies.get("token")}`
                    }
                }
            );

            alert("Store created successfully.");

            window.location.reload();

        } catch (err: any) {

            setError(
                err.response?.data?.message || "Something went wrong."
            );
        }
    }

    return (

        <div className="bg-white w-[430px] rounded-xl shadow-xl p-6">

            <h2 className="text-2xl font-bold text-center mb-6">
                Create Store
            </h2>

            <div className="space-y-4">

                <input
                    className="w-full border rounded-md p-2"
                    placeholder="Store Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="w-full border rounded-md p-2"
                    placeholder="Store Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <textarea
                    rows={3}
                    className="w-full border rounded-md p-2 resize-none"
                    placeholder="Store Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <select
                    className="w-full border rounded-md p-2"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                >
                    <option value="">Select Owner</option>

                    {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                            {owner.name} ({owner.email})
                        </option>
                    ))}
                </select>

                {error && (
                    <p className="text-red-500 text-sm">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-3">

                    <button
                        onClick={onClose}
                        className="border px-4 py-2 rounded-md"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Create Store
                    </button>

                </div>

            </div>

        </div>

    );
}