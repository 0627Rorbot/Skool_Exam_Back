const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

// routers
const userRouters = ["Test"];
const adminRouters = ["Test", "Problems"];
const adminEmails = ["admin@gmail.com"];

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, "rorbotskool", {
    expiresIn: "30d",
  });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (username.trim() == "" || email.trim() == "" || password.trim() == "") {
      return res
        .status(400)
        .json({ status: false, message: "User information is incorrect." });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ status: false, message: "User already exists" });
    }

    // define user auth
    let role = "user";
    if (adminEmails.filter((e) => e == email).length > 0) role = "admin";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });
    if (user) {
      res.json({
        status: true,
        message: "You have registered successfully.",
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role),
        },
      });
    } else {
      res
        .status(400)
        .json({ status: false, message: "Unable to access server." });
    }
  } catch (error) {
    res
      .status(405)
      .json({ status: false, message: "Unable to access server." });
  }
};

// Authenticate User
const authUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        status: true,
        message: "You have successfully logged in.",
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role),
        },
      });
    } else {
      res
        .status(401)
        .json({ status: false, message: "You don't have an account." });
    }
  } catch (error) {
    res
      .status(405)
      .json({ status: false, message: "Unable to access server." });
  }
};

// Get All Users (Admin only)
const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

// Delete User (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.remove();
      res.json({ status: true, message: "User has been deleted." });
    } else {
      res.status(404).json({ status: false, message: "User not found." });
    }
  } catch (error) {
    res
      .status(405)
      .json({ status: false, message: "Unable to access server." });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUsers,
  deleteUser,
};
