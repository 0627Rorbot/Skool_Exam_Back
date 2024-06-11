const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

const apiRoutes = require("./routers");

app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/db")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

// api routes
app.use("/api", apiRoutes);
// Register a new user

// Root endpoint
app.get("/", async (req, res) => {
  res.send("Success!!");
});

// Start the server
app.listen(5000, () => {
  console.log("Server started on 5000");
});
