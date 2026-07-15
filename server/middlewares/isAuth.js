import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token
        if (!token) {
            return res.status(401).json({ message: "Authentication required" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(401).json({ message: "User not found" })
        }

        req.user = user
        next()
    } catch (error) {
        console.error("Auth error:", error)
        return res.status(401).json({ message: "Invalid or expired token" })
    }
}

export default isAuth
