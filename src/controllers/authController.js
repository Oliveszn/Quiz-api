const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const db = require("../../db");

//register a user
const registerUser = async (req, res) => {
  const client = await db.connect();
  const { username, password } = req.body;
  try {
    await client.query("BEGIN");
    if (![username, password].every(Boolean)) {
      return res.status(401).json({ error: "missing fields" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists, Try another",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    //creating new user after all checks
    const newUser = await User.create({
      username,
      password: hash,
    });

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await client.query("COMMIT");

    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .json({
        success: true,
        message: "Account created with ₦5000 welcome bonus!",
        user: {
          id: newUser.id,
          username: newUser.username,
        },
      });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  } finally {
    client.release();
  }
};

////login user
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findByUsername(username);
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const checkPasswordMatch = await User.comparePassword(
      password,
      existingUser.password
    );
    if (!checkPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: existingUser.id, username: existingUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        samesite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      //  secure: process.env.NODE_ENV === 'production', // Should be true in prod
      .json({
        success: true,
        message: "Logged in successfully",
        token,
        user: {
          id: existingUser.id,
          username: existingUser.username,
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/////logout
const logout = (req, res) => {
  try {
    return res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logout,
};
