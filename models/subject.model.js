const mongoose = require("mongoose");

// Define the Subject schema
const subjectSchema = new mongoose.Schema(
  {
    title: {
      type: String, //title
      unique: true,
      required: true,
    },
    content: {
      type: String, //description
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    cnt: {
      type: Number, //problem cnt
      required: true,
    },
    problems: {
      type: [], //problem cnt
      required: true,
    },
  },
  { collection: "subject" }
);

// Create the models
const Subject = mongoose.model("Subject", subjectSchema);

// Export both models
module.exports = Subject;
