import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

const jwtSecret=process.env.JWT_SECRET as string;

declare global {
    namespace Express {
      interface Request {
        userId?: string;
        role?: string;
      }
    }
  }
  

export function middleware(req : Request,res : Response,next : NextFunction){
    const token=req.headers['authorization'] ?? "";
    const decoded=jwt.verify(token,jwtSecret as string) ;
    if(typeof decoded == "string"){
        return;
    }
    if(decoded.userId){
        req.userId=decoded.userId
        req.role=decoded.role
        next();
    }
    else{
        res.status(403).json({
            message : "unauthorized"
        })
    }
}   