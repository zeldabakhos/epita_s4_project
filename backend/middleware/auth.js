// /backend/middleware/auth.js
const User = require("../models/userModels");
const jwt = require("jsonwebtoken");

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided!" });
  }

  try {
    // Accept "Bearer <token>" or just "<token>"
    const parts = authHeader.split(" ");
    const token = parts.length === 2 ? parts[1] : parts[0];

    // Try multiple secrets in case login used a different one
    const secrets = [
      process.env.SECRET_TOKEN_KEY,
      process.env.JWT_SECRET,
    ].filter(Boolean);

    let decoded = null;
    let lastErr = null;
    for (const secret of secrets) {
      try {
        decoded = jwt.verify(token, secret);
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!decoded) {
      // optional debug: console.error("JWT verify failed:", lastErr?.message);
      return res.status(401).json({ message: "Unauthorized!" });
    }

    // Be tolerant to different payload shapes
    const uid =
      decoded.userId ||
      decoded._id ||
      decoded.id ||
      (decoded.user && (decoded.user._id || decoded.user.id));

    if (!uid) {
      // optional debug: console.error("Token payload missing user id:", decoded);
      return res.status(401).json({ message: "Unauthorized!" });
    }

    req.userId = String(uid);

    // Ensure user still exists
    const user = await User.findById(req.userId).select("_id");
    if (!user) return res.status(404).json({ message: "User not found!" });

    next();
  } catch (_err) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
};
