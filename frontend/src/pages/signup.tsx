import { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom";
import Cookies from "js-cookie";

import { api } from "../api";

export function Signup(){

    const navigate=useNavigate();

    const [ name, setName ]=useState<string>("");
    const [ email, setEmail ]=useState<string>("");
    const [ address, setAddress ]=useState<string>("");
    const [ password, setPassword ]=useState<string>("");

    const [ error, setError ]=useState<string>("");
    
    useEffect(()=>{
        const token=Cookies.get('token');
        const role=Cookies.get('role')
        if(token!=undefined){
            if(role=='OWNER'){
                navigate('/ratings')
            }
            else{
                navigate('/stores')
            }
        }
    },[])

    function hasUppercase(pass : string){
        return /[A-Z]/.test(pass);
    }
    function hasSpecial(pass : string){
        return /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    }
    function hasLowercase(pass : string){
        return /[a-z]/.test(pass);
    }
    
    async function handleSignup(){
        
        const trimmedName=name.trim();
        const trimmedAddress=address.trim();
        const trimmedPassword=password.trim();
        const trimmedEmail=email.trim();
        
        if(trimmedName.length<5){
            setError("Minimum 5 letters required");
            return;
        }
        else if(trimmedName.length>60){
            setError("Maximum 60 letters allowed");
            return;
        }
        if(trimmedAddress==""){
            setError("Please Enter Address")
            return;
        }
        else if(trimmedAddress.length>200){
            setError("Address length should be less than 200 letters")
            return;
        }
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
        try{
            await api.post("/signup",{
                name,
                email,
                address,
                password
            });

            alert('User Signed up successfully')
            navigate('/login');

        }catch(e : any){
            if(e.response?.status==409){
                alert('User already exists');
                return;
            }
            else if(e.response?.status==500){
                alert('Internal Server Error')
                return;
            }
        }
        

    }

    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-xl font-bold text-center mb-6">
            Create Account for rating stores only.
        </h1>

        {error && (
            <p className="mb-4 text-sm text-red-600 text-center">
            {error}
            </p>
        )}

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full border rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={handleSignup}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Sign Up
                </button>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                        onClick={() => navigate("/login")}
                        className="text-blue-600 hover:underline"
                    >
                        Login
                    </button>
                </p>

            </div>
            
        </div>

    </div>
    );

}