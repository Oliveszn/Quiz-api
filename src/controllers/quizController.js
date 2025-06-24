const Quiz = require("../models/Quiz");

const getTopics = async (req, res) => {
  try {
    const topics = await Quiz.getTopics();

    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "some error occured",
    });
  }
};

const getDifficulties = async (req, res) => {
  try {
    const { topicId } = req.params; // or req.query if using query params

    if (!topicId) {
      return res.status(400).json({
        success: false,
        message: "Topic ID is required",
      });
    }

    const difficulties = await Quiz.getDifficulties(topicId);

    res.status(200).json({
      success: true,
      data: difficulties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch difficulty levels",
    });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { topicId, difficulty } = req.params;

    const questions = await Quiz.getQuestions(topicId, difficulty);

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
    });
  }
};

const checkAnswer = async (req, res) => {
  try {
    const { questionId, userAnswer } = req.body;

    const isCorrect = await Quiz.validateAnswer(questionId, userAnswer);

    res.status(200).json({
      success: true,
      isCorrect,
      message: isCorrect ? "Correct!" : "Wrong answer",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getTopics, getDifficulties, getQuestions, checkAnswer };
