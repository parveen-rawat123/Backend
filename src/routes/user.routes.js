import { Router } from "express";
import { LoginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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
    
router.route("/logIn").get(LoginUser)

router.route("/logout").post(
     verifyJWT, 
    logoutUser)

export default router;