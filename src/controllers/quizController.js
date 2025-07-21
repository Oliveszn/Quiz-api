const Quiz = require("../models/Quiz");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} = require("../utils/errors");

const getTopics = asyncHandler(async (req, res) => {
  const topics = await Quiz.getTopics();

  res.status(200).json({
    success: true,
    data: topics,
  });
});

const getDifficulties = asyncHandler(async (req, res) => {
  const { topicId } = req.params;

  if (!topicId) {
    throw new ValidationError("Topic ID is required");
  }

  const difficulties = await Quiz.getDifficulties(topicId);

  res.status(200).json({
    success: true,
    data: difficulties,
  });
});

const getQuestions = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const { difficulty, page = 1, limit = 1 } = req.query;

  if (!topicId) {
    throw new ValidationError("Valid topic ID is required");
  }

  if (!difficulty) {
    throw new ValidationError("Difficulty level is required");
  }

  const allowedDifficulties = ["easy", "medium", "hard"];
  if (!allowedDifficulties.includes(difficulty.toLowerCase())) {
    throw new ValidationError("Difficulty must be one of: easy, medium, hard");
  }

  const result = await Quiz.getQuestions(topicId, difficulty);

  // Handle pagination manually
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedQuestions = result.slice(startIndex, endIndex);
  const totalPages = Math.ceil(result.length / limitNum);

  res.status(200).json({
    success: true,
    data: {
      questions: paginatedQuestions,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalQuestions: result.length,
        hasMore: pageNum < totalPages,
      },
      meta: {
        topicId,
        difficulty,
        timestamp: new Date().toISOString(),
      },
    },
  });
});

const checkAnswer = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { userAnswer } = req.body;

  if (!questionId || userAnswer === undefined) {
    throw new ValidationError("Question ID and answer are required");
  }

  const result = await Quiz.validateAnswer(questionId, userAnswer);
  console.log(result);

  res.status(200).json({
    success: true,
    data: {
      isCorrect: result.isCorrect,
      correctAnswer: result.correctAnswer, // this is to show correct answer if wrong
      explanation: result.explanation, // while this is to throw an explanation
    },
    message: result.isCorrect ? "Correct!" : "Wrong answer",
  });
});

module.exports = { getTopics, getDifficulties, getQuestions, checkAnswer };
