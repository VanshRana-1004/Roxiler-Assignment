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
  

export function middleware(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token missing",
            });
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        req.userId = decoded.userId;
        req.role = decoded.role;

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}