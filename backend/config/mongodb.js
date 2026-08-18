import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected', () => console.log("Database Connected"))
    mongoose.connection.on('error', (err) => console.log("Database Connection Error:", err))

    const uri = process.env.MONGODB_URI || process.env.MONGO_URI

    if (!uri) {
        console.error("MongoDB connection string is not defined. Set MONGODB_URI or MONGO_URI in environment variables.")
        return;
    }

    try {
        await mongoose.connect(uri)
        // mongoose.connect will throw on auth/connection errors which are logged below
    } catch (error) {
        console.error("Initial MongoDB connection error:", error);
    }

}

export default connectDB;

// Do not use '@' symbol in your databse user's password else it will show an error.
