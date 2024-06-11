const express = require("express");
const router = express.Router();
const multer = require("multer");
const subjectController = require("../../controllers/subjectController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets"); // Store uploaded files in the 'assets' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname); // Create a unique filename for each uploaded file
  },
});

const upload = multer({ storage: storage });

// Define routes
router
  .post("/subjects", upload.single("file"), subjectController.saveSubject) // save problms
  .get("/subjects", subjectController.readSubjects) // read problems
  .delete("/subjects", subjectController.deleteSubject); // delete subject

// get test problems subject_id, problem_cnt
router.get("/problems", subjectController.getSubjectProblems);

module.exports = router;
