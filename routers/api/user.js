const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  getUsers,
  deleteUser,
} = require("../../controllers/userController");
const { protect, admin } = require("../../middlewares/authMiddleware");

router.route("/register").post(registerUser).get(protect, admin, getUsers);
router.post("/login", authUser);
router.route("/:id").delete(protect, admin, deleteUser);

module.exports = router;
