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
