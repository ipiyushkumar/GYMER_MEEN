const multer = require("multer");
const path = require("path");

const __location = path.dirname(__filename);

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__location, "../uploads");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

module.exports = multer({ storage });
