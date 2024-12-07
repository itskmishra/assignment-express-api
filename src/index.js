import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';

// loading env variables
dotenv.config({ path: "./.env" });

// connecting database
// Success: connection start server, Error: give error
connectDB()
.then(() => {
        // checking for errors
        app.on("error",(err) =>{
            console.log("Server ERROR:", err);
            process.exit(1);
        })
        // starting server
        app.listen(process.env.PORT, () => {
            console.log("Server is up and running");
        })
})
.catch((err) => {
    console.log("MongoDB Connection failed:", err);
})
