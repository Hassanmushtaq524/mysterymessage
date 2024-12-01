import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { Message } from "@/model/User";

export async function POST(req: Request) {
    await dbConnect();
    try {
        const session = await getServerSession();
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Not Authenticated"
            }, { status: 401 });
        }

        // get username (where to send) and content
        const { username, content } = await req.json();
        // find the user using username
        const foundUser = await UserModel.findOne({ username: username });
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }
        // check if the user is accepting messages
        if (!foundUser.isAcceptingMessage) {
            return Response.json({
                success: false,
                message: "User not accepting messages"
            }, { status: 401 });
        }
        // we add the message to the user's messages
        const newMessage = {
            content: content,
            createdAt: new Date()
        }
        foundUser.messages.push(newMessage as Message);
        // save the user and return success
        await foundUser.save();

        return Response.json({
            success: true,
            message: "Message sent successfully"
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