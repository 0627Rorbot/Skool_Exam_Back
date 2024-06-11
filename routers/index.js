const express = require("express");
const router = express.Router();
const userRouter = require("./api/user");
const subjectRouter = require("./api/subject");

// Define routes
router.use("/user", userRouter);
router.use("/test", subjectRouter);

module.exports = router;
