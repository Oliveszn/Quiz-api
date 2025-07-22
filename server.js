require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const db = require("./db");
const authRoute = require("./src/routes/authRoutes");
const quizRoute = require("./src/routes/quizRoutes");
const { errorHandler } = require("./src/middleware/errorHandler");
const { urlVersioning } = require("./src/middleware/apiVersioning");

const app = express();
const PORT = process.env.PORT;

///to test conection
db.query("SELECT NOW()")
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB connection error:", err));

app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL,
    methods: ["POST", "GET", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
// app.use("/api/v1", urlVersioning("v1"));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1", quizRoute);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`server on ports ${PORT}`));
