const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const img_dir = "uploads";
    if (!fs.existsSync(img_dir)) {
      fs.mkdirSync(img_dir, { recursive: true });
    }
    if (file.mimetype.startsWith("image/")) {
      cb(null, img_dir);
    }
  },

  filename: (req, file, cb) => {
    const extension = file.originalname.split(".").pop() || undefined;
    const fileName = Date.now() + "." + extension;
    req.fileName = fileName;
    cb(null, fileName);
  },
});

// Multer config
const upload = multer({
  storage: storage,
  limits: {
    // fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png"];

    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      const error = new Error(
        `Only ${allowedExtensions.toString()} files are allowed.`
      );
      error.status = 400;
      error.code = "FILE_FORMAT_NOT_MATCH";
      return cb(error);
    }

    cb(null, true);
  },
});

// Middleware to check Profile file size before uploading
const checkProfileSize = async (req, res, next) => {
  const limit = 2 * 1024 * 1024;
  if (
    !req.headers["content-length"] ||
    parseInt(req.headers["content-length"]) > limit
  ) {
    const error = Error(
      `Profile file size exceeds 2MB limit or no file provided`
    );
    error.status = 400;
    return next(error);
  }
  next();
};
module.exports = { upload, checkProfileSize };
