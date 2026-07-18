import express from "express";
import jwt from "jsonwebtoken";
import cors from 'cors';
import { middleware } from "./middleware.js";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const jwtSecret=process.env.JWT_SECRET as string;

const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();

app.get("/ping",(req,res)=>{
    res.send("pong");
})

app.post("/signup", async (req, res) => {
    try {
        
        const { name, email, password, address } = await req.body;

        const hashedPassword = await bcrypt.hash(password, 5);

        const exists= await prisma.user.findFirst({
            where : {
                email
            }
        })

        if(exists){
            return res.status(409).json({
                message: "User already exists"
            })
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                address,
                role: "USER" 
            }
        });

        res.status(201).json({
            message: "User created successfully",
            user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

app.post("/login", async (req, res) => {

    try{
        
        const { email, password } = await req.body;
        const user = await prisma.user.findFirst({
            where:{
                email
            }
        })
        if(!user){
            return res.status(403).json({
                message : "No user Found with the given email."
            })
        }
        const hashedPassword = user.password;
        const isValidPassword = await bcrypt.compare(password,hashedPassword);

        if(!isValidPassword){
            return res.status(401).json({
                message : "Wrong Credentials"
            })
        }

        const userId=user.id;
        const role=user.role;
        
        const token=jwt.sign({
            userId,role,email
        },jwtSecret as string);

        return res.status(201).json({
            token : token,
            message : "Signed in successfully."
        })

    } catch (err) {
        res.status(500).json({
            error : err,
            message : "Internal Error"
        })
    }

});

app.listen(8080,()=>{
    console.log("Server is running on port 8080");
})