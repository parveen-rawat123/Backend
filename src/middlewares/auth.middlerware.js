import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            console.log("token not generated")
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

       const user = await User.findById(decodedToken?._id)
            .select("-password -RefreshToken")

        if (!user) {
            throw new ApiError(401, "invaild access token")
        }
      
        req.user = user;
        next();

    } catch (error) {
        console.log("error", error)
        throw new ApiError(400, error?.message || "invalid access token")
    }
});