// backend/src/health.js
const router = require("express").Router();
router.get("/", (_req,res)=>res.json({ok:true, ts:Date.now()}));
module.exports = router;
