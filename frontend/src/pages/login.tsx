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
            if(!hasSpecial(trimmedPassword)) console.log("special")
            if(!hasUppercase(trimmedPassword)) console.log("upper");
            setError("Password must contain at least one UpperCase letter and one special character")
            return;
        }
        if(!trimmedEmail.includes('@gmail.com') || !hasLowercase(trimmedEmail)){
            setError("Enter valid email address")
            return;
        }

        setError("");

        const response = await api.post("/login",{
            email,
            password
        });

        if(response.status == 403){
            alert('User not found');
            return;
        }
        else if(response.status == 500){
            alert('Internal Server Error');
            return;
        }
        else if(response.status == 401){
            alert('Wrong Credentials')
            return;
        }

        const token = response.data.token;
        const role = response.data.role;

        Cookies.set("token", token, {
            expires: 7,
        });

        if(role=='USER' || role=='ADMIN'){
            navigate('/stores')
        }
        else {
            navigate('/ratings')
        }

    }

    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">
            Create Account
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