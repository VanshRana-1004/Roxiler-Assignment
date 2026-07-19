import express from "express";
import jwt from "jsonwebtoken";
import cors from 'cors';
import { middleware } from "./middleware.js";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { generatePassword } from "./utils/password.js";
import dotenv from "dotenv";
dotenv.config();

const jwtSecret=process.env.JWT_SECRET as string;

const app = express();
app.use(express.json());
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}));

const prisma = new PrismaClient();



app.get("/ping",(req,res)=>{
    res.send("pong");
})



// only simple user (USER) can signup
app.post("/signup", async (req, res) => {
    try {
        
        const { name, email, password, address } = req.body;

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
                role: "ADMIN" 
            }
        });

        return res.status(201).json({
            message: "User created successfully",
            user
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// any type of user (USER, ADMIN, OWNER) can login 
app.post("/login", async (req, res) => {

    try{
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
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

        const address=user.address;
        const userId=user.id;
        const role=user.role;

        // console.log(jwtSecret);
        const token=jwt.sign({
            userId,role,email
        },jwtSecret as string);

        return res.status(200).json({
            role,
            userId,
            address,
            token : token,
            message : "Signed in successfully."
        })

    } catch (err) {
        return res.status(500).json({
            error : err,
            message : "Internal Error"
        })
    }

});



// Admin can create a new user of any type (ADMIN, USER, OWNER) and can also create a store 
// Admin can also view all the stores along with their AVG ratings, similarly all the users with their corresponding roles (if Owner then rating as well)
// Admin can also view ratings submitted by all the users
app.post('/create-user', middleware, async (req, res)=>{
    try{
        
        if(req.role!="ADMIN"){
            return res.status(403).json({
                message : 'unauthorized request'
            })
        }

        const {name, email, address, role} = req.body;

        const password=generatePassword();
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
                role: role
            }
        });
        
        // console.log(password);

        if(password==undefined){
            return res.status(500).json({message:"unable to create password"})
        }
        return res.status(201).json({
            message: "User created successfully.",
            generatedPassword: password,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address
            }
        });

    }catch(err){
        console.error(err);
        return res.status(500).json({
            message: "Something went wrong"
        });
    }
})

app.post('/create-store', middleware, async (req, res)=>{
    try{

        if(req.role!="ADMIN"){
            return res.status(403).json({
                message : 'unauthorized request'
            })
        }
        const {name, address, email, ownerId } = req.body;
        
        const exists = await prisma.store.findFirst({
            where :{
                email
            }
        })

        if(exists){
            return res.status(409).json({
                message: "Store already exists"
            })
        }
        
        const store=await prisma.store.create({
            data: {
                name,
                email,
                address,
                ownerId
            }
        })

        return res.status(201).json({
            message : "Store Created Successfully",
            store
        })


    }catch(err){
        console.error(err);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
})

app.get('/all-users', middleware, async (req, res) =>{
    try {
        if(req.role!="ADMIN"){
            return res.status(403).json({
                message : 'unauthorized request'
            })
        }

        const users = await prisma.user.findMany({
            include: {
                store: {
                    include: {
                        ratings: true,
                    },
                },
            },
        });

        const result = users.map((user) => {
            if (user.role === "OWNER" && user.store) {
                const ratings = user.store.ratings;

                const avgRating =
                    ratings.length === 0
                        ? 0
                        : ratings.reduce((sum, r) => sum + r.rating, 0) /
                          ratings.length;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    address: user.address,
                    role: user.role,
                    averageRating: Number(avgRating.toFixed(2)),
                };
            }

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role,
            };
        });

        res.status(200).json({
            users: result,
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
})

app.get("/all-ratings", middleware, async (req, res) => {
    try {
        if(req.role!="ADMIN"){
            return res.status(403).json({
                message : 'unauthorized request'
            })
        }

        const ratings = await prisma.rating.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        address: true
                    },
                },
                store: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        address : true
                    },
                },
            },
        });

        res.status(200).json({
            ratings,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
});



// a simple user (USER) can rate, update previous rating for any previous store and see on which store he/she rate

app.post('/rate-store', middleware, async (req, res) =>{
    try{
        if(req.role!="USER"){
            return res.status(403).json({
                message : 'unauthorized request'
            })
        }

        const {storeId, rating} = req.body;
        const userId=req.userId;
        if(userId==undefined){
            return res.status(4).json({
                message : "userId underfined"
            })
        }
        const exists = await prisma.rating.findFirst({
            where : {
                userId,
                storeId
            }
        })

        if(exists){
            await prisma.rating.update({
                where :{
                    id : exists.id
                },
                data : {
                    rating
                }
            })

            return res.status(201).json({
                message : "Rating updated successfully"
            })
        }

        const response=await prisma.rating.create({
            data :{
                userId,
                storeId,
                rating
            }
        })

        return res.status(201).json({
            message : "Rating store successfully"
        })
    }catch(err){
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
})

app.get('/user-ratings', middleware, async (req, res) =>{
    try{

        if(req.role!="USER"){
            return res.status(403).json({
                message : 'unauthorized request'
            })
        }

        const id=req.userId;
        if(id==undefined){
            return res.status(403).json({
                message : "not valid userId"
            })
        }
        
        const result=await prisma.rating.findMany({
            where :{
                userId : id
            },
            include : {
                store :{
                    include : {
                        ratings : {
                            select : {
                                rating : true
                            }
                        }
                    }
                }
            }
        })

        const data = result.map((item) =>{
            const ratings = item.store.ratings;
            const avg = ratings.reduce((sum,r)=> sum + r.rating,0)/ratings.length;
            return {
                myRating : item.rating,
                avgRating : Number(avg.toFixed(2)),
                store :{
                    id : item.store.id,
                    name : item.store.name,
                    email : item.store.email,
                    address : item.store.address
                }
            }
        })

        return res.status(200).json({
            ratings : data
        })

    }catch(err){
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
})



// a store owner can only see the ratings of his/her store but can't change ratings or can't rate other stores
app.get('/store-ratings', middleware, async (req, res) =>{
    try{
        if(req.role!="OWNER"){
            return res.status(403).json({
                message : 'unauthorized request'
            })
        }

        const userId=req.userId;
        if(userId==undefined){
            return res.status(403).json({
                message : "not valid userId"
            })
        }

        const result=await prisma.store.findUnique({
            where :{
                ownerId : userId 
            },
            include : {
                ratings :{
                    select :{
                        rating : true,
                        user : {
                            select : {
                                id : true,
                                name : true,
                                email : true,
                                address : true
                            }
                        }
                    }
                }
            }
        })

        return res.status(200).json({
            ratings : result?.ratings ?? []
        })

    }catch(err){
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
})



// all users can update their passwords

app.post('/update-password', middleware, async (req, res) =>{
    try{
        const { password}=req.body;
        const userId = req.userId;
        // console.log(userId);
        if(userId==undefined){
            return res.status(404).json({
                message : "userId undefined"
            })
        }
        const exists=await prisma.user.findUnique({
            where :{
                id : userId
            }
        })
        if(!exists){
            return res.status(404).json({
                message : "user don't exists"
            })
        }
        const hashedPassword=await bcrypt.hash(password, 5);

        const result=await prisma.user.update({
            where :{
                id : userId
            },
            data :{
                password : hashedPassword 
            }
        })

        return res.status(200).json({
            message : "Password updated successfully"
        })
    }catch(err){
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
})

// both ADMIN and simple USER can view list of all the stores
app.get('/all-stores', middleware, async (req, res) =>{
    try{
        if(req.role=="OWNER"){
            return res.status(403).json({
                message : 'unauthorized request'
            })
        }


        const stores = await prisma.store.findMany({
            include : {
                ratings :{
                    select :{
                        rating : true
                    }
                }
            }
        })

        const result = stores.map((store) => {
            const avgRating =
                store.ratings.length === 0
                    ? 0
                    : store.ratings.reduce((sum, r) => sum + r.rating, 0) /
                      store.ratings.length;

            return {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                averageRating: Number(avgRating.toFixed(2)),
            };
        });

        return res.status(200).json({
            stores: result,
        });
    }catch(err){
        console.error(err);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
})



app.listen(8080,()=>{
    console.log("Server is running on port 8080");
})