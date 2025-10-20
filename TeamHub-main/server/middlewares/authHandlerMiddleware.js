import User from "../models/userModel.js";
import { verifyJWTToken } from "../utiles/createJWTToken.js";

export const AuthenticationMiddleware = async (req, res, next) => {
    try {
        // Get token from cookies OR Authorization header
        let token = req.cookies?.user; 
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // If no token found, deny access
        if (!token) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        // Verify token
        const decoded = verifyJWTToken(token);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Find the user in DB
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Login to access these services",
            error: error.message
        });
    }
};

export const AuthorizationMiddleware = (req, res, next) => {
    console.log("AuthorizationMiddleware called");
    next();
};
