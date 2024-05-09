import { apiError } from "../utils/apiError.js";
import fs from "fs";
import multer from "multer";
import path from "path";

// Define your file size limit in bytes
const FILE_SIZE_LIMIT = 2 * 1024 * 1024 * 1024; // 2 GB in bytes

const upload = () => {
  try {
    const storage = multer.diskStorage({
      destination: async (req, file, cb) => {
        // Extract the folder name from the file fieldname
        const folderName = file.fieldname;

        // Create the folder if it doesn't exist
        const folderPath = `./public/${folderName}`;
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }

        cb(null, folderPath);
      },
      filename: async (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const fileName = path.basename(file.originalname, extension); // Using original filename without extension
        const timestamp = Date.now();
        cb(null, `${fileName}_${timestamp}${extension}`); // Appending timestamp after the original filename
      },
    });

    return multer({
      limits: { fileSize: FILE_SIZE_LIMIT },
      storage: storage,
    });
  } catch (error) {
    throw new apiError({
      statusCode: error.statusCode || 500, // Default to 500 if no status code provided
      message: error.message,
    });
  }
};

export default upload;
