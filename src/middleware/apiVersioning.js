const urlVersioning = (version) => (req, res, next) => {
  if (req.path.startsWith(`/api/${version}`)) {
    next();
  } else {
    res.status(404).json({
      success: false,
      error: "Api version is not supported",
    });
  }
};

const headerVersion = (version) => (req, res, next) => {
  if (req.get("Accept-Version") === version) {
    next();
  } else {
    res.status(404).json({
      success: false,
      error: "Api version is not supported",
    });
  }
};

module.exports = { urlVersioning, headerVersion };
