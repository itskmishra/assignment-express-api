import mongoose from 'mongoose';

// connect server to database using mongoose
const connectDB = async() => {
    try{
        const connectionInst = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log("Database is connected");
    }catch(error){
        console.log("Error in database connection", error);
        process.exit(1);
    }
}

export default connectDB;
