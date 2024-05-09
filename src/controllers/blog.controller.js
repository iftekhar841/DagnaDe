import blogService from "../services/blog.service.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Handle the blog response
const uploadBlog = asyncHandler(async (req, res) => {
  try {
    const files = req.files;
     // Assuming you're expecting a file named 'blogImage'
    const blogImageLocalPath = files && files.blogImage ? files.blogImage[0].path.substring(files.blogImage[0].path.indexOf('public//') + 8) : null;
    const pdfFileForBlogLocalPath = files && files.pdfFileForBlog ? files.pdfFileForBlog[0].path.substring(files.pdfFileForBlog[0].path.indexOf('public//') + 8) : null;

    const blogResponse = await blogService.uploadBlog(
        req.body,
        blogImageLocalPath,
        pdfFileForBlogLocalPath
    );
    return res
      .status(200)
      .json(
        new apiResponse(200, blogResponse, "Blog Uploaded Successfully!"),
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new apiError({ statusCode: error.statusCode, message: error.message }),
      );
  }
});


const getUploadedBlog = asyncHandler(async (req, res) => {
    try {
        const blogResponse = await blogService.getUploadedBlog();
        return res
           .status(200)
           .json(
                new apiResponse(200, blogResponse, "Blog Fetched Successfully!"),
            );
    } catch (error) {
        return res
           .status(500)
           .json(
                new apiError({ statusCode: error.statusCode, message: error.message }),
            );
    }
})


const updateUploadedBlog = asyncHandler(async (req, res) => {
  try {
    const files = req.files;
     // Assuming you're expecting a file named 'blogImage'
    const blogImageLocalPath = files && files.blogImage ? files.blogImage[0].path.substring(files.blogImage[0].path.indexOf('public//') + 8) : null;
    const pdfFileForBlogLocalPath = files && files.pdfFileForBlog ? files.pdfFileForBlog[0].path.substring(files.pdfFileForBlog[0].path.indexOf('public//') + 8) : null;
    
    const blogResponse = await blogService.updateUploadedBlog(
        req.body,
        req.query,
        blogImageLocalPath,
        pdfFileForBlogLocalPath
    );

    return res
           .status(200)
           .json(
                new apiResponse(200, blogResponse, "Blog Updated Successfully!"),
            );
    
  } catch (error) {
    return res
           .status(500)
           .json(
                new apiError({ statusCode: error.statusCode, message: error.message }),
            );
  }
})


const deleteUploadedBlog = asyncHandler(async (req, res) => {
  try {
    const blogResponse = await blogService.deleteUploadedBlog(
        req.params
    );
    return res
     .status(200)
     .json(
        new apiResponse(200, blogResponse, "Blog Deleted Successfully!"),
      );
      
  } catch (error) {
    return res
     .status(500)
     .json(
        new apiError({ statusCode: error.statusCode, message: error.message }),
      );
  }
});

export default {
    uploadBlog,
    getUploadedBlog,
    updateUploadedBlog,
    deleteUploadedBlog
}