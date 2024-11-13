import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const {username, email, password} = await req.json();
        
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {
                status: 400
            });
        }

        const existingUserByEmail = await UserModel.findOne({ email });
        const verifyCode = generateOTP();
        // check email use
        if (existingUserByEmail) {
            // email exists and is already verified
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "Email is already in use"
                }, {
                    status: 400
                });
            }
            // email exists but not verified
            const hashedPassword = await bcrypt.hash(password, 10);
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = verifyCode;
            existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
            await existingUserByEmail.save();
        } else {
            // now register new user
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
    
            // save user
            const newUser = new UserModel({
                username, 
                email, 
                password: hashedPassword, 
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                message: []
            })
    
            await newUser.save();
        }

        // send email for verification
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {
                status: 500
            })
        }

        return Response.json({
            success: true,
            message: "User registered successfully, please verify your email"
        }, {
            status: 200
        })

    } catch (error) {
        console.error(error);
        return Response.json({
            success: false,
            message: "Error registering user"
        }, {
            status: 500
        })
    }
}