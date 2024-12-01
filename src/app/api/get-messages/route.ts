import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";


export async function GET(req: Request) {
    await dbConnect() 
    try {
        const session = await getServerSession();
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Not Authenticated"
            }, { status: 401 });
        }

        const userId = new mongoose.Types.ObjectId(session.user._id);

        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { "messages.createdAt": -1 }},
            { $group: { _id: "$_id", 
                        messages: { $push: "$messages" } 
                      }}
        ])

        if (!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 400 });
        }

        return Response.json({
            success: true,
            messages: user[0].messages
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