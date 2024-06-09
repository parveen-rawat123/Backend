import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    origin: process.env.CORS_OROGIN
}))

// express can used json req
app.use(express.json({
    limit: "16kb"
}));

// express can used url req, extended : for handle nested object 
app.use(express.urlencoded({
    extended: true,
   // limit: "16kb"
}));

// for  access public folders
app.use(express.static("public"))
app.use(cookieParser())

import userRouter  from "./routes/user.routes.js"
 
app.use("/api/v1/user" , userRouter)
// router and controler 
export { app } 