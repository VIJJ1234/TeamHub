import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI environment variable is not set");
            console.error("Please create a .env file with MONGO_URI=your_mongodb_connection_string");
            process.exit(1);
        }
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully to:", process.env.MONGO_URI.split('@')[1] || 'database');
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}   

export default connectDB;