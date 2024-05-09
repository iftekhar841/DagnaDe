import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { apiError } from "../utils/apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, localFolderName) => {
  
  try {

    if (!Array.isArray(localFilePath)) {
      localFilePath = [localFilePath]; // Convert to an array if it's not already
    }
    if (!localFilePath.length) return null;

    let uploadedMedia = [];
    //upload the file on cloudinary
    for await (const file of localFilePath) {
      try {
        console.log('cloud',file);
        console.log(("file.path................: ", file));
        const uploadedResult = await cloudinary.uploader.upload(file.path, {
          folder: localFolderName,
          resource_type: "auto",
        });
console.log('uploadedResult',uploadedResult);
        // Save the uploaded image details in Array (URL, public ID, etc.)
        uploadedMedia.push({
          url: uploadedResult.secure_url,
          public_id: uploadedResult.public_id,
          // Add more details as needed
        });

        fs.unlinkSync(file.path);
        console.log(("file.path: ", file.path));
      } catch (error) {
        // Handle errors during upload
        for await (const file of localFilePath) {
          fs.unlinkSync(file.path);
        }
        throw new apiError(404, `Error in uploading Media File(s): ${error.message}`);
      }
    }
    console.log(("uploadedMedia: ", uploadedMedia));
    return uploadedMedia;
  } catch (error) {
    // Handle errors during upload
    throw new apiError(404, `Error uploading image: ${error.message}`);
    fs.unlinkSync(localFilePath); //remove the locally saved temp file as the upload operation got failed
    return null;
  }
};

const deleteOnCloudinary = async (public_id, resource_type = "auto") => {
  try {
    if (!public_id) return null;

    //delete file from cloudinary
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: `${resource_type}`,
    });

    if (result.result != "ok") {
      throw new apiError(404, "User avatar not found to delete");
    }

    return result;
  } catch (error) {
    throw new apiError(404, "Delete on cloudinary failed, " + error);
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
