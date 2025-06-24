const db = require("../../db");
const bcrypt = require("bcryptjs");

const User = {
  async create({ username, password }) {
    const { rows } = await db.query(
      `INSERT INTO users (username, password)
            VALUES ($1, $2)
            RETURNING id, username, created_at`,
      [username, password]
    );
    return rows[0];
  },

  async findByUsername(username) {
    const { rows } = await db.query("SELECT * from users WHERE username = $1", [
      username,
    ]);
    return rows[0];
  },

  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  },

  async delete(username) {
    // Using CASCADE in your schema will automatically delete related records
    const { rowCount } = await db.query(
      "DELETE FROM users WHERE username = $1 RETURNING id",
      [username]
    );
    return rowCount > 0; // Returns true if user was deleted
  },

  async findByUserId(userId) {
    const query = "SELECT * FROM users WHERE id = $1";
    const { rows } = await db.query(query, [userId]);
    return rows[0];
  },

  async getMovements(
    userId,
    { page = 1, limit = 5, sortBy = "created_at", sortOrder = "DESC" }
  ) {
    // Calculate offset
    const offset = (page - 1) * limit;

    // Validate sort columns to prevent SQL injection
    const validSortColumns = ["created_at", "amount", "type"];
    const sortColumn = validSortColumns.includes(sortBy)
      ? sortBy
      : "created_at";
    const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { rows: movements } = await db.query(
      `SELECT * FROM movements 
       WHERE user_id = $1 
       ORDER BY ${sortColumn} ${order}
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) FROM movements WHERE user_id = $1`,
      [userId]
    );

    return {
      movements,
      totalCount: parseInt(countRows[0].count),
      totalPages: Math.ceil(countRows[0].count / limit),
      currentPage: page,
    };
  },
};

module.exports = User;
