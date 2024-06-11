const Subject = require("../models/subject.model"); // Assuming you have a User model
const bcrypt = require("bcrypt");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const _ = require("lodash");
const { title } = require("process");

//  get all subjects
exports.readSubjects = async (req, res) => {
  try {
    const db_subjects = await Subject.find({});

    // data filtering
    const res_subjects =
      db_subjects &&
      db_subjects.map((subject) => ({
        _id: subject._id,
        title: subject.title,
        content: subject.content,
        filename: subject.filename,
        cnt: subject.cnt,
        // problems: subject.problems,
      }));

    if (res_subjects)
      [
        res.json({
          status: true,
          data: res_subjects,
          message: "Subjects is loaded.",
        }),
      ];
  } catch (error) {
    res.status(401).json({ status: false, message: "Save failed" });
  }
};

// save subject
exports.saveSubject = async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const fileName = req.file.filename;

  if (title.trim() == "" || content.trim() == "" || fileName.trim() == "") {
    res.status(401).json({ status: false, message: "Cannot read subject" });
    return;
  }

  try {
    const db_subject = await Subject.findOne({ title: title });
    if (db_subject !== null) {
      res
        .status(401)
        .json({ status: false, message: "Subject is already exists." });
      return;
    }

    // extract pdf file to text data
    const filePath = "./assets/" + fileName;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // covert from text to json
    const allParsedQuestions = parseTextToJson(data.text);
    const problem_count = allParsedQuestions.length;

    let subject = await Subject.create({
      title: title,
      content: content,
      filename: fileName,
      cnt: problem_count,
      problems: allParsedQuestions,
    });
    res.json({ status: true, data: subject, message: "Save Successfully." });
  } catch (error) {
    res.status(401).json({ status: false, message: "Save failed" });
  }
};

// save subject
exports.getSubjectProblems = async (req, res) => {
  const { subject_id, problem_cnt } = req.query;

  try {
    const db_subject = await Subject.findOne({ _id: subject_id });
    if (db_subject != null) {
      const db_problems = db_subject.problems;
      const db_totalcnt = db_problems.length;

      const randoms = getRandomArrays(db_totalcnt, problem_cnt);
      const res_problems = randoms.map((i) => db_problems[i]);

      res.json({
        status: true,
        data: res_problems,
        message: "Load Successfully.",
      });
    } else
      res.status(401).json({ status: false, message: "Cannot load subject" });
  } catch (error) {
    res.status(401).json({ status: false, message: "Load failed!" });
  }
};

// delete subject
exports.deleteSubject = async (req, res) => {
  try {
    const { subject_id } = req.query;
    if (subject_id != null) {
      await Subject.deleteOne({ _id: subject_id });
      res.json({
        status: true,
        data: subject_id,
        message: "Delete Successfully.",
      });
    } else
      res.status(401).json({ status: false, message: "Cannot read subject" });
  } catch (error) {
    res.status(401).json({ status: false, message: "Delete failed" });
  }
};

// update subject
const parseTextToJson = (text) => {
  const questionBlocks = text.split(/Topic \dQuestion #\d+/).slice(1);

  const parsedQuestions = questionBlocks.map((block) => {
    const questionTextMatch = block.match(
      /(.*?\?)\s*([A-D]\..*?Correct Answer:)/s
    );
    const questionText = questionTextMatch ? questionTextMatch[1].trim() : "";

    const optionsMatch = block.match(/([A-D]\..*?)Correct Answer:/s);
    const options = optionsMatch
      ? optionsMatch[1]
          .trim()
          .split("\n")
          .map((option) => option.trim())
      : [];

    const correctAnswerMatch = block.match(/Correct Answer:\s*([A-D])/);
    const correctAnswer = correctAnswerMatch ? correctAnswerMatch[1] : "";

    const communityVotesMatch = block.match(
      /Community vote distribution\n(.*)/s
    );
    const communityVotesText = communityVotesMatch
      ? communityVotesMatch[1].trim()
      : "";
    const communityVotes = {};
    if (communityVotesText) {
      communityVotesText.split(/\s+/).forEach((vote) => {
        const [option, percentage] = vote.split("(");
        if (option && percentage) {
          communityVotes[option.trim()] = parseInt(percentage);
        }
      });
    }

    const correctAnswerText = options.find((option) =>
      option.startsWith(correctAnswer)
    );

    // Validate parsed data
    if (!questionText || !correctAnswer || !correctAnswerText) {
      return null; // Skip invalid entries
    }

    return {
      question: questionText,
      options: options,
      correct_answers: [correctAnswer],
      correct_answer_texts: [correctAnswerText],
      community_vote_distribution: communityVotes,
    };
  });

  // Filter out null values (invalid entries)
  return parsedQuestions.filter((question) => question !== null);
};

const getRandomArrays = (total, cnt) => {
  if (isNaN(total) || isNaN(cnt) || cnt > total) {
    return [];
  }

  const sourceArray = _.range(1, total + 1);
  const shuffledArray = _.shuffle(sourceArray);
  const selectedArray = shuffledArray.slice(0, cnt);

  return selectedArray;
};
