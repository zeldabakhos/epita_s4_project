const User = require("../models/userModels");
const jwt = require("jsonwebtoken");

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided!" });
  }

  try {
    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN_KEY);

    req.userId = decoded.userId;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
};
