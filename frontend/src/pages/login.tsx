import { useState } from "react";
import { useNavigate} from "react-router-dom";
import Cookies from "js-cookie";

import { api } from "../api";

export function Login(){

    const navigate=useNavigate();

    const [ email, setEmail ]=useState<string>("");
    const [ password, setPassword ]=useState<string>("");

    const [ error, setError ]=useState<string>("");

    function hasUppercase(pass : string){
        return /[A-Z]/.test(pass);
    }
    function hasSpecial(pass : string){
        return /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    }
    function hasLowercase(pass : string){
        return /[a-z]/.test(pass);
    }
    
    async function handleLogin(){
        
        const trimmedPassword=password.trim();
        const trimmedEmail=email.trim();
        
        if(trimmedPassword.length<8 || trimmedPassword.length>16){
            setError("Password length should be from 8 to 16 letters")
            return;
        }
        else if(!hasUppercase(trimmedPassword) || !hasSpecial(trimmedPassword)){
            setError("Password must contain at least one UpperCase letter and one special character")
            return;
        }
        if(!trimmedEmail.includes('@gmail.com') || !hasLowercase(trimmedEmail)){
            setError("Enter valid email address")
            return;
        }

        setError("");

        try {
            const response = await api.post("/login", {
                email,
                password
            });

            alert("User Signed Succeddfully");

            const token = response.data.token;
            const role = response.data.role;
            const userId = response.data.userId;
            const address =  response.data.address;


            Cookies.set("token", token);
            Cookies.set("role", role);
            Cookies.set("email", trimmedEmail);
            Cookies.set("address", address);
            Cookies.set("userId", userId);

            if(role=='USER' || role=='ADMIN'){
                navigate('/stores')
            }
            else {
                navigate('/ratings')
            }

        } catch (err: any) {

            if (err.response?.status === 401) {
                alert("Wrong Credentials");
            }
            else if (err.response?.status === 403) {
                alert("User not found");
            }
            else if (err.response?.status === 500) {
                alert("Internal Server Error");
            }
            else {
                alert("Something went wrong");
            }
        }

        

    }

    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
            Welcome Back!
        </h1>

        {error && (
            <p className="mb-4 text-sm text-red-600 text-center">
            {error}
            </p>
        )}

            <div className="space-y-4">
            
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Login
                </button>

                <p className="text-center text-sm text-gray-600">
                    new here?{" "}
                    <button
                        onClick={() => navigate("/signup")}
                        className="text-blue-600 hover:underline"
                    >
                        Signup
                    </button>
                </p>

            </div>
            
        </div>

    </div>
    );

}