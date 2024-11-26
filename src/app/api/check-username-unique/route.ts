import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UserNameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username')
        };
        // validate username with zod
        const res = UserNameQuerySchema.safeParse(queryParams);
        console.log(res); //TODO: remove 
        if (!res.success) {
            return Response.json({
                success: false,
                message: "Invalid username"
            }, { status: 400 });
        }

        const { username } = res.data;
        // validate this username
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Invalid username"
            }, { status: 400 });
        }

        return Response.json({
            success: true,
            message: "Valid username"
        }, { status: 200 })

    } catch (error) {
        console.log(error); //TODO: remove
        return Response.json({
            success: false,
            message: "Error checking for unique username"
        }, { status: 500 });
    }
}