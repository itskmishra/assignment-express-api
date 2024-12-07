import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api_error.js';
import { ApiResponse } from '../utils/api_response.js';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

// simple utils function to generate refresh and access token
const genRefreshandAccessToken = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = await user.genAccToken();
        const refreshToken = await user.genRefToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}); // save without validating for required fields & more
        return { accessToken, refreshToken };
    }catch(err){
        console.log(err);
        throw new ApiError(500, "Something went wrong");
    }
}

const registerUser = asyncHandler(async(req, res) => {
    // destructing and checking values from request body;
    const { firstName, lastName, email, password, confirmPassword, phone } = req.body;
    if([firstName, email, password, confirmPassword, phone].some((field) => field?.trim() == "")) {
        throw new ApiError(400, "Invalid Request");
    }
    if(password != confirmPassword){
        throw new ApiError(400, "Password and confirm password doesn't match", {password, confirmPassword})
    }
    // check user existence
    const existingUser = await User.findOne({
        $or: [{email}, {phone}]
    });
    if(existingUser){
        throw new ApiError(409, "User with following phone and email already exists");
    }

    // generate token for email and phone verification
    const emailVerifyToken = await crypto.randomBytes(20).toString('hex');
    const phoneVerifyToken = await crypto.randomBytes(6).toString('hex');
    // create a new user object
    const newUser =  await User.create({
        phone,
        email,
        password,
        firstName,
        lastName,
        emailVerificationToken:emailVerifyToken,
        phoneVerificationToken:phoneVerifyToken
    });

    // save user and return if success otherwise throw an error
    const userCreated = await User.findById(newUser._id).select("-password -emailVerificationToken -phoneVerificationToken");
    if(!userCreated){
        throw new ApiError(500, "Internal Server Error");
    }
    // here we can add logic for email for verification
    return res.status(201).json(
        new ApiResponse(200, userCreated, "User created Successfully")
    )
});


const loginUser = asyncHandler(async(req, res) => {
    // destruct and check data
    const {email, password} = req.body;
    if(!email){
        throw new ApiError(400, "Username or Email is requied");
    }
    // check user and password
    const user = await User.findOne({email});
    if(!user){
        throw new ApiError(404, "Not Found");
    }
    const isPassValid = await user.isPasswordCorrect(password);
    if(!isPassValid){
        throw new ApiError(401, "Invalid credentials");
    }
    // generating tokens
    const { accessToken, refreshToken } = await genRefreshandAccessToken(user._id);
    // setting cookies
    const options = {
        httpOnly: true,
        secure: true,
    }
    // sending response and setting tokens in request
    return res.status(200)
            .cookie("auth_token", accessToken, options)
            .cookie("session_token", refreshToken, options)
            .json(new ApiResponse(200,
                    { accessToken, refreshToken}, "User logged in successfully"));
});


const logoutUser = asyncHandler(async(req, res) => {
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(userId, { $set: { refreshToken: undefined }},{new:true}).select("-password -emailVerificationToken -phoneVerificationToken");
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res.status(200)
            .clearCookie("auth_token", options)
            .clearCookie("session_token", options)
            .json(new ApiResponse(200, null,"User logged out"));
});


const refreshUserToken = asyncHandler(async(req, res) => {
    const refToken = req.cookies.session_token || req.body.refreshToken
    if(!refToken){
        throw new ApiError(401, "Unauthorized request");
    };
    try{
        const decoded = jwt.verify(refToken, process.env.REFRESH_TOKEN_SECRET);
        const userId = decoded._id
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        };
        if(refToken !== user.refreshToken){
            throw new ApiError(401, "Refresh token expired loggin again");
        }
        // generating tokens
        const { accessToken, refreshToken } = await genRefreshandAccessToken(user._id);
        // setting cookies
        const options = {
            httpOnly: true,
            secure: true,
        }
        // sending response and setting tokens in request
        return res.status(200)
            .cookie("auth_token", accessToken, options)
            .cookie("session_token", refreshToken, options)
            .json(new ApiResponse(200,
                { accessToken, refreshToken }, "Tokens refreshed successfully"));

    }catch(err){
        throw new ApiError(500, "Something went wrong");
    }
});

const changeCurrentPassword = asyncHandler(async(req, res) =>{
    const { oldPassword, newPassword, confirmPassword} = req.body;
    if(newPassword !== confirmPassword){
        throw new ApiError(400, "New password and confirm password doesn't match", {newPassword, confirmPassword});
    }
    const user = await User.findById(req.user?._id);
    const ispass = await user.isPasswordCorrect(oldPassword);
    if(!ispass){
        throw new ApiError(400, "Invalid credentials", {password});
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});

const getUserProfile = asyncHandler(async(req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user));
});

const updateProfileData = asyncHandler(async(req, res) =>{
    const { firstName, lastName, email, phone } = req.body;
    // check user existence
    const user = await User.findById(req.user?._id);

    const newUser =  await User.findOneAndUpdate(user._id, {
        phone,
        email,
        firstName,
        lastName,
    }, {new :true}).select("-password -emailVerificationToken -phoneVerificationToken");

    if(!newUser){
        throw new ApiError(500, "Internal Server Error");
    }
    return res.status(201).json(
        new ApiResponse(200, newUser, "User update Successfully")
    )

});

const deleteUser = asyncHandler(async(req, res) =>{
    const user = await User.findOneAndDelete(req?.user?._id)
    return res.status(200).json(new ApiResponse(200, null, "User deleted Successfully"));
});


const sendemailVerificationToken = asyncHandler(async(req, res) =>{
    const { email } = req.body;
    if(!email){
        throw new ApiError(400, "Email is required", {email});
    }
    const isuser = await User.findOne({email})
    if(!isuser){
        throw new ApiError(401, "Unauthorized");
    }
    const emailVerifyToken = await crypto.randomBytes(20).toString('hex');
    const user = await User.findOneAndUpdate(isuser._id, { emailVerificationToken: emailVerifyToken})
    if(!user){
        throw new ApiError(500, "Internal Server error");
    }
    // logic to send mail to user here
    return res.status(200).json( new ApiResponse(200, "User verification email send"))
})

const sendphoneVerificationToken = asyncHandler(async(req, res) =>{
    const { phone } = req.body;
    if(!phone){
        throw new ApiError(400, "Email is required", {email});
    }
    const isuser = await User.findOne({phone})
    if(!isuser){
        throw new ApiError(401, "Unauthorized");
    }
    const phoneVerifyToken = await crypto.randomBytes(6).toString('hex');
    const user = await User.findOneAndUpdate(isuser._id, { phoneVerificationToken: phoneVerifyToken})
    if(!user){
        throw new ApiError(500, "Internal Server error");
    }
    // logic to send mail to user here
    return res.status(200).json( new ApiResponse(200, "User phone verification code send"))
})

const verifyEmail = asyncHandler(async(req, res) => {
    const  token  = req.params.token
    if(!token){
        throw new ApiError(400, "Token not found", {token});
    }

    const isuser = await User.findOne({emailVerificationToken:token})
    if(!isuser){
        throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findOneAndUpdate( isuser?._id,
        { emailVerified: true, emailVerificationToken: undefined}, {new:true})
        .select("-password -emailVerificationToken -phoneVerificationToken")

    if(!user){
        throw new ApiError(500, "Something went wrong");
    }
    return res.status(200).json(new ApiResponse(200, user,"Email verified"))
})

const verifyPhone = asyncHandler(async(req, res) => {
    const { token } = req.body
    if(!token){
        throw new ApiError(400, "Token not found", {token});
    }

    const isuser = await User.findOne({phoneVerificationToken:token})
    if(!isuser){
        throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findOneAndUpdate( isuser?._id,
        { phoneVerified: true, phoneVerificaitonToken: undefined}, {new:true})
        .select("-password -emailVerificationToken -phoneVerificationToken")

    if(!user){
        throw new ApiError(500, "Something went wrong");
    }
    return res.status(200).json(new ApiResponse(200, user,"Email verified"))
})

export { registerUser,
    verifyEmail,
    verifyPhone,
    sendemailVerificationToken,
    sendphoneVerificationToken,
    loginUser,
    logoutUser,
    refreshUserToken,
    updateProfileData,
    deleteUser,
    getUserProfile,
    changeCurrentPassword};
