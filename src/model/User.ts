import mongoose, {Schema, Document} from "mongoose";


/**
 * Define message schema
 */
export interface Message extends Document {
    content: string;
    createdAt: Date;
}



export interface User extends Document {
    username: string; 
    email: string;    
    password: string; 
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[]
}


/**
 * Message schema
 */
const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now // Sets the default value to the current date
    }
})



/**
 * User schema
 */
const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    verifyCode: {
        type: String,
        required: [true, "Verify Code is required"],
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, "Verify Code Expiry is required"],
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAcceptingMessage: {
        type: Boolean,
        default: true 
    },
    messages: [{
        type: MessageSchema
    }]
    
});


const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)

export default UserModel;