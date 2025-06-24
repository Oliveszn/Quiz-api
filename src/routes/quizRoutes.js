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
router.get("/topics/:topicId/:difficulty", getQuestions);
router.post("/question", checkAnswer);

module.exports = router;
