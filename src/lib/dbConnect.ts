import mongoose from "mongoose";


type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

// Connect
async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
        connection.isConnected = db.connections[0].readyState;
        console.log("DB Connected successfully")
    } catch (error) {
        console.log("DB Connection failed")
        process.exit(1);
    }
}

export default dbConnect;