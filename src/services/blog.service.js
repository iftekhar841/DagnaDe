import { isValidObjectId } from "mongoose";
import Blog from "../models/blog.model.js";
import { apiError } from "../utils/apiError.js";
import fs from 'fs';
import path from 'path';

// Get the directory path of the current module file
let currentDir = path.dirname(new URL(import.meta.url).pathname).substring(1);
console.log("Current directory: " , currentDir);
currentDir = currentDir.replace(/%20/g, ' ');


// Give the access for admin to upload his client blog api's
const uploadBlog = async (
  blogDetails,
  blogImageLocalPath,
  pdfFileForBlogLocalPath,
) => {
  //TODO: Upload a new Blog

  const { blogAuthorName, blogTitle, blogDescription } = blogDetails;

  if (!blogAuthorName || !blogTitle || !blogDescription) {
    throw new apiError(400, "Missing Fiels Are Required");
  }

  if (!blogImageLocalPath || !pdfFileForBlogLocalPath) {
    throw new apiError(400, "Image and PDF file is required");
  }

  const newBlog = await Blog.create({
    blogAuthorName,
    blogTitle,
    blogDescription,
    blogImage: blogImageLocalPath,
    pdfFileForBlog: pdfFileForBlogLocalPath,
  });

  const fetchedCreatedBlog = await Blog.findById(newBlog._id);
  if (!fetchedCreatedBlog._id) {
    throw new apiError(500, "Something went wrong while uploading the blog");
  }
  return fetchedCreatedBlog;
};

// Get all the blog which is uploaded by admin
const getUploadedBlog = async () => {
  const allBlogs = await Blog.find();
  if (allBlogs.length === 0) {
    throw new apiError(404, "No Blogs Found");
  }
  return allBlogs;
};


// Give the acess to the admin to update the blog fields
const updateUploadedBlog = async (blogDetails,queryParams, blogImageLocalPath,pdfFileForBlogLocalPath) => {
  console.log("blogDetaisl", blogDetails);
  
  const { blogId } = queryParams;
  if(!isValidObjectId(blogId)) {
    throw new apiError(400, "Invalid Blog Id Format");
  }

  console.log("blogImageLocalPath",blogImageLocalPath);
  console.log("pdfFileForBlogLocalPath",pdfFileForBlogLocalPath);

  const fetchExistingBlog = await Blog.findById(blogId);
  console.log("Fetching existing blog", fetchExistingBlog);
  if(!fetchExistingBlog) {
    throw new apiError(404, "Blog Not Found");
  }

   // Remove existing blog image if it exists
   if (blogImageLocalPath && fetchExistingBlog.blogImage) {
    const imagePath = path.join(currentDir, '..','..', 'public', fetchExistingBlog.blogImage);
    console.log("imagePath", imagePath);
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Removed existing blog image: ${imagePath}`);
    }
}

// Remove existing PDF file for blog if it exists
if (pdfFileForBlogLocalPath && fetchExistingBlog.pdfFileForBlog) {
    const pdfPath = path.join(currentDir, '..','..', 'public', fetchExistingBlog.pdfFileForBlog);
    console.log("pdfPath", pdfPath);
    console.log("pdfPath", pdfPath);
    if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
        console.log(`Removed existing PDF file for blog: ${pdfPath}`);
    }
}

  // If blog image is provided, update the blogImage field
  if(blogImageLocalPath) {
    fetchExistingBlog.blogImage = blogImageLocalPath;
  }
  // If pdf file is provided, update the pdfFileForBlog field
  if(pdfFileForBlogLocalPath) {
    fetchExistingBlog.pdfFileForBlog = pdfFileForBlogLocalPath;
  }

  // Update other blog details
  fetchExistingBlog.set(blogDetails);

  // Save the changes to the blog document
  const updateBlog = await fetchExistingBlog.save();

  console.log("Updated blog", updateBlog);

  return updateBlog;
}


// Give the access to the admin to delete the blog
const deleteUploadedBlog = async (paramsData) => {

  const { blogId } = paramsData;
  if(!isValidObjectId(blogId)) {
    throw new apiError(400, "Invalid Blog Id Format");
  }

  // delete the blog on the basis of blogId
  const deletedBlog = await Blog.findByIdAndDelete(blogId);
  if(!deletedBlog) {
    throw new apiError(404, "Blog Not Found");
  }
  return deletedBlog;
}


export default {
  uploadBlog,
  getUploadedBlog,
  updateUploadedBlog,
  deleteUploadedBlog
};
