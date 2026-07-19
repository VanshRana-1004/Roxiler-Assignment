import crypto from "crypto";

export function generatePassword(length = 10) {
    const chars = `!@#$%^&*(),.?":{}|<>ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;
    let password = "";
    let num=Math.floor(Math.random() * (19 - 0 + 1));
    password+=chars[num%20];
    num+=21;
    password+=chars[num];

    for(let i=0;i<10;i++){
        password += chars[Math.floor(Math.random() * chars.length)];
    }

    return password;
}