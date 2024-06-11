import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/APIerror.js";
import { uploadonCloudinary } from "../utils/cloudnary.js";
import { APIResponse } from "../utils/APIresponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefereshTokens = async (user_id) => {
    try {
        console.log(user_id)
        const user = await User.findById(user_id);
        const AccessToken = user.generateAccessToken();
        console.log(AccessToken)
        const RefreshToken = user.generateRefereshToken();

        user.refreshToken = RefreshToken;
        await user.save({ validBeforeSave: false });

        return { AccessToken, RefreshToken };
    } catch (error) {
        console.log(error)
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
    console.log("user", req.body)
    const { username, email, password } = req.body;
    console.log("email", email)
    if (!username && !email) {
        throw new ApiError(400, "Username or email password is required");
    }

    const findUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (!findUser) {
        throw new ApiError(404, "User does not exists");
    }
    console.log("user is exits");

    const isPasswordVaild = await findUser.isPasswordMatched(password);
    if (!isPasswordVaild) {
        throw new ApiError(401, "password Incorrect");
    }
    console.log("yes password is matched")

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
    const { refreshToken } = req.user;
    if (!refreshToken) {
        throw new ApiError(401, "user not login")
    };

    const data = await User.findByIdAndUpdate(
        // @ts-expect-error
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
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

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomeingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    if (!incomeingRefreshToken) {
        throw new ApiError(400, "user unauthrized")
    }

    try {
        const decodedToken = jwt.verify(incomeingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "invalid refresh token")
        }
        if (incomeingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is invalid")
        }

        const option = {
            httpOnly: true,
            secure: true,
        };

        const { AccessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        res.status(200)
            .clearCookie("AccessToken", AccessToken, option)
            .clearCookie("RefreshToken", newRefreshToken, option)
            .json(200, {
                AccessToken, refreshToken: newRefreshToken
            },
                "Access Token refreshed"
            )
    } catch (error) {
        console.log(error)
        throw new ApiError(402, error?.message ||
            "invalid refresh token "
        )
    }
})

export { registerUser, LoginUser, logoutUser, refreshAccessToken };
