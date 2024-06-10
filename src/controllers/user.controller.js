import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APIerror.js";
import { uploadonCloudinary } from "../utils/cloudnary.js";
import { APIResponse } from "../utils/APIresponse.js";

const generateAccessAndRefereshTokens = async (user_id) => {
    try {
        const user = User.findById(user._id);

        const AccessToken = user.generateAccessToken();
        const RefreshToken = user.generateAccessToken();

        user.refreshToken = RefreshToken;
        await user.save({ validBeforeSave: false });

        return { AccessToken, RefreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while Token");
    }
};

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
    const alreadyRegister = await User.findOne({
        $or: [{ email }, { username }],
    });
    if (alreadyRegister) {
        throw new ApiError(409, "User already registered");
    }
    const avatarLocalpath = req.files?.avatar[0]?.path;

    let coverimgLocalpath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverimgLocalpath = req.files.coverImage[0].path;
    }

    if (!avatarLocalpath) {
        throw new ApiError(400, "Avatar file is required");
    }
    const avatar = await uploadonCloudinary(avatarLocalpath);
    const coverImage = await uploadonCloudinary(coverimgLocalpath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username,
    });

    //const createdUser = await user.findById(user._id).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(500, "Something went wrong while register user");
    }

    console.log("user resiterred", user);
    return res
        .status(201)
        .json(new APIResponse(200, user, "User Registered Successfully"));
});

const LoginUser = asyncHandler(async (req, res) => {
    // get data from req.body
    // username or email
    // find user
    // password check
    // generate access and refresh token
    // send token in cookie
    const { username, email, password } = req.body;

    if (!username || !email) {
        throw new ApiError(400, "Username or email password is required");
    }

    const findUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (!findUser) {
        throw new ApiError(404, "User does not exists");
    }

    const isPasswordVaild = await findUser.isPasswordMatched(password);
    if (!isPasswordVaild) {
        throw new ApiError(401, "password Incorrect");
    }

    const { AccessToken, RefreshToken } = await generateAccessAndRefereshTokens(
        findUser._id
    );
    console.log(AccessToken);
    console.log(RefreshToken);

    const loggedInUser = await User.findById(findUser._id).select(
        "-password -refreshToken"
    );

    const option = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("AccessToken", AccessToken, option)
        .cookie("RefreshToken", RefreshToken, option)
        .json(
            new APIResponse(
                200,
                {
                    user: loggedInUser,
                    AccessToken,
                    RefreshToken,
                },
                "User logged In Successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const logoutuser = User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );
    const option = {
        httpOnly: true,
        secure: true,
    };
   return res.status(200)
   .clearCookie("AccessToken", option)
   .clearCookie("RefreshToken", option)
   .json(new APIResponse(200, "user loggedOut Successfull"))
});

export { registerUser, LoginUser, logoutUser };
