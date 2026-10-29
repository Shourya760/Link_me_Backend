import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const url = process.env.MONGO_URL;
        if (!url) throw new Error("MONGO_URL is not configured");
        const dbName = process.env.MONGO_DB_NAME || "linkme";

        const conn = await mongoose.connect(url, { dbName, });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error("MongoDB error name:", error.name);
        console.error("MongoDB error code:", error.code);
        console.error("MongoDB error message:", error.message);
        process.exit(1);
    }
};

export default connectDB;
