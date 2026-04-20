import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token; // check karein ki cookie name match kar raha hai

        if (!token) {
            // Status 401 zyada sahi hai authentication missing ke liye
            return res.status(401).json({ message: "No token provided. Please login again." });
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!verifyToken) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }

        req.userId = verifyToken.userId;
        next();

    } catch (error) {
        return res.status(500).json({ message: `isAuth error: ${error.message}` });
    }
};

export default isAuth;
