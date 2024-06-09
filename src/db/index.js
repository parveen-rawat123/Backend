import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`)
        console.log(`MongoDb connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("DB connection error", error)
        process.exit(1)
    }
};

export default connectDB;