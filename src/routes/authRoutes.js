const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
} = require("../controllers/authController");

const router = express.Router();

// signup route
router.post("/register", registerUser);

//login route
router.post("/login", loginUser);

// logout route
router.post("/logout", logout);

module.exports = router;
