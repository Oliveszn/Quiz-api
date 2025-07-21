const express = require("express");
const {
  getTopics,
  getDifficulties,
  getQuestions,
  checkAnswer,
} = require("../controllers/quizController");

const router = express.Router();

router.get("/topics", getTopics);
router.get("/topics/:topicId", getDifficulties);
router.get("/topics/:topicId/questions", getQuestions);
router.post("/question/:questionId", checkAnswer);

module.exports = router;

// http://localhost:5000/api/v1/topics/59de6a48-46a0-4b08-9d99-40fce512dac9/questions?difficulty=easy
