import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    firstName:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
    },
    lastName:{
        type:String,
        lowercase:true,
        trim:true,
    },
    password:{
        type: String,
        required:true,
    },
    phone:{
        type: String,
        required:true,
        unique: true,
    },
    emailVerified:{
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken:{
        type: String,
    },
    phoneVerificationToken: {
        type: String
    }
},{ timestamps:true });


// generating password hash before saving. (middleware)
userSchema.pre('save', async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcryptjs.hash(this.password, 10);
    next();
});

// method the check user password on login
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcryptjs.compare(password, this.password);
}

// creating access token
userSchema.methods.genAccToken = async function(){
    return await jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}

// creating refresh token
userSchema.methods.genRefToken = async function(){
    return await jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export const User = mongoose.model("User", userSchema);
