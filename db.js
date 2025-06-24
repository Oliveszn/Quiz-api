require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD, // Same as pgAdmin login
  port: process.env.DB_PORT,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};
//   CREATE TABLE users (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     userName VARCHAR(255) NOT NULL UNIQUE,
//     password VARCHAR(255) NOT NULL,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
//   );

//   CREATE TABLE topics (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   name VARCHAR(255) NOT NULL UNIQUE
// );

// CREATE TABLE user_scores (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//   topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
//   difficulty VARCHAR(50) NOT NULL,  -- "Easy", "Medium", "Hard"
//   score DECIMAL(15, 2) NOT NULL,    -- Raw score for this attempt
//   is_highscore BOOLEAN DEFAULT FALSE, -- Marks if this is their best
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );

// CREATE INDEX idx_user_highscores ON user_scores (user_id, topic_id, difficulty) WHERE is_highscore = TRUE;

// CREATE TABLE quizzes (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   title VARCHAR(255) NOT NULL,               -- e.g., "Science Trivia"
//   topic_id UUID REFERENCES topics(id),       -- Links to your existing "topics" table
//   difficulty VARCHAR(50) NOT NULL,           -- "Easy", "Medium", "Hard"
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );

// CREATE TABLE questions (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
//   question_text TEXT NOT NULL,               -- The question itself
//   options JSONB NOT NULL,                    -- Format: {"A": "Option 1", "B": "Option 2", ...}
//   correct_option CHAR(1) NOT NULL,           -- "A", "B", "C", etc.
//   points INTEGER DEFAULT 1,                  -- Score weight for this question
//   explanation TEXT                           -- Optional: Why this answer is correct
// );
