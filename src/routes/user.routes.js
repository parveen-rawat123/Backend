import { Router } from "express";
import { LoginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import {upload}  from "../middlewares/multer.middlerware.js"
import { verifyJWT } from "../middlewares/auth.middlerware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser)
    
router.route("/logIn").post(LoginUser)

router.route("/logout").post(
     verifyJWT, 
    logoutUser)

router.route("/refreshToken").post(refreshAccessToken)

export default router;