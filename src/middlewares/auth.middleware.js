import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/api_error.js';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const verifyJwt = asyncHandler(async(req, _, next)=>{
    try{
        const access_token = req.cookies?.auth_token || req.header("Authorization")?.replace("Bearer ", "");
        if(!access_token){
            throw new ApiError(401, "Unauthorized");
        }
        const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET)
        // get user and set it in the request object
        const user = await User.findById(decoded._id).select("-password -emailVerificationToken -phoneVerificationToken");
        if(!user){
            throw new ApiError(401, "Invalid access token");
        }
        req.user = user;
        next();
    }catch(err){
        throw new ApiError(401,err?.message|| "Invalid access token");
    }
});
