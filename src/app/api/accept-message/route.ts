import { getServerSession } from "next-auth";
import { User } from "next-auth";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: Request) {
    await dbConnect();
    try {
        // chack if session available
        // instead of passing the jwt token, we use this method from next-auth
        const session = await getServerSession();
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Not Authenticated"
            }, { status: 401 });
        }

        // we get the new accepting state and then update user
        const { acceptingMessage } = await req.json();
        const user: User = session.user;
        const updatedUser = await UserModel.findByIdAndUpdate(user._id, 
                                          { isAcceptingMessage: acceptingMessage },
                                          { new: true });
        
        // updated user not found
        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "Failed to update user"
            }, { status: 400 });
        }
        
        return Response.json({
            success: true,
            message: "Successfully updated user"
        }, { status: 200 });
    } catch (error) {
        return Response.json({
            success: false,
            message: "Internal server error"
        }, {
            status: 500
        });
    }
}


export async function GET(req: Request) {
    await dbConnect();
    try {
        const session = await getServerSession();
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Not Authenticated"
            }, { status: 401 });
        }

        const user = await UserModel.findById(session.user._id);

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 400 });
        }

        return Response.json({
            success: false,
            isAcceptingMessage: user.isAcceptingMessage
        }, { status: 400 });

    } catch (error) {
        return Response.json({
            success: false,
            message: "Internal server error"
        }, {
            status: 500
        });
    }
}