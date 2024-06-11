import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        console.log("reqbody",req)
        const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        console.log("token",token)

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        console.log("decode token", decodedToken)

       const user = await User.findById(decodedToken?._id)
            .select("-password -RefreshToken")
            
            if (!user) {
                throw new ApiError(401, "invaild access token")
                }
                
            console.log("user", user)
      
        req.user = user;
        next();

    } catch (error) {
        console.log("error", error)
        throw new ApiError(400, error?.message || "invalid access token")
    }
});