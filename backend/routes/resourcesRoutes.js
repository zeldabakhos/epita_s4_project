const express = require("express");
const { resourcesHandler } = require("../controllers/resourcesController");

const router = express.Router();
router.post("/", resourcesHandler);

module.exports = router;
