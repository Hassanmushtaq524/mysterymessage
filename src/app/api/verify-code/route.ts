import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export async function POST(req: Request) {
    await dbConnect();
    try {
        const { username, code } = await req.json();
        const decodedUsername = decodeURIComponent(username);
        
        const user = await UserModel.findOne({
            username: decodedUsername
        })

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {status: 200})
        }
        
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (!isCodeValid) {
            return Response.json({
                success: false,
                message: "Invalid code"
            }, { status: 400 });
        }

        if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Code has expired. Please sign up again."
            }, { status: 400 });
        }
        
        // add to user and save
        user.isVerified = true;
        await user.save();
        // return
        return Response.json({
            success: true,
            message: "User validated"
        }, { status: 200 });
    } catch (error) {
        return Response.json({
            success: false,
            message: "Error registering user"
        }, {
            status: 500
        });
    }
}