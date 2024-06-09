import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APIerror.js";
import { uploadonCloudinary } from "../utils/cloudnary.js"
import { APIResponse } from "../utils/APIresponse.js"
const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation
    // check if user already registered 
    // chekc for image, avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token 
    // check for user creation 
    const { username, email, fullname, password } = req.body;

    if (!username || !email || !fullname || !password) {
        throw new ApiError(400, "All fields is required");
    }
    const alreadyRegister = User.find({
        $or: [{ email }, { username }]
    });
    if (alreadyRegister) {
        throw new ApiError(409, "User already registered")
    }
    const avatarLocalpath = req.files?.avatar[0]?.path;
    const coverimgLocalpath = req.files?.coverimage[0]?.path;
    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploadonCloudinary(avatarLocalpath)
    const coverImage = await uploadonCloudinary(coverimgLocalpath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowercase()
    })
    const createdUser = user.finById(user._id).select("-password -refreshToken")
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while register user")
    };

    return res.status(201).json(
        new APIResponse(200, createdUser, "User Registered Successfully")
    )
})

export { registerUser }