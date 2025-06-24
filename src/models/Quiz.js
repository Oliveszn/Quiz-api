const db = require("../../db");

const Quiz = {
  async getTopics() {
    const { rows } = await db.query(`SELECT * FROM topics`);
    return rows;
  },

  async getDifficulties(topicId) {
    const { rows } = await db.query(
      `
      SELECT DISTINCT difficulty 
      FROM quizzes 
      WHERE topic_id = $1
      ORDER BY difficulty
    `,
      [topicId]
    );
    return rows.map((row) => row.difficulty);
  },

  /////added ilike to make inputs case insensitive
  async getQuestions(topicId, difficulty) {
    const { rows } = await db.query(
      `
      SELECT q.* 
      FROM questions q
      JOIN quizzes z ON q.quiz_id = z.id
      WHERE z.topic_id = $1 
      AND z.difficulty ILIKE $2
      ORDER BY RANDOM()
      LIMIT 30
    `,
      [topicId, difficulty]
    );
    return rows;
  },

  async validateAnswer(questionId, userAnswer) {
    const { rows } = await db.query(
      `
      SELECT correct_option 
      FROM questions 
      WHERE id = $1
    `,
      [questionId]
    );

    if (rows.length === 0) throw new Error("Question not found");
    return rows[0].correct_option === userAnswer.toUpperCase();
  },
};

module.exports = Quiz;
