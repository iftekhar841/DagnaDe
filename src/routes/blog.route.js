import { Router } from "express";
import blogController from "../controllers/blog.controller.js";
import fileAndDocUpload from "../middlewares/multer.middleware.js";

const blog_route = Router();

// Routes
blog_route.post(
  "/upload-blog",
  fileAndDocUpload("blogImage", "pdfFileForBlog").fields([
    { name: "blogImage", maxCount: 1 },
    { name: "pdfFileForBlog", maxCount: 1 },
  ]),
  blogController.uploadBlog,
);

blog_route.get("/get-all-blogs", blogController.getUploadedBlog);

blog_route.put("/update-blog", 
fileAndDocUpload("blogImage", "pdfFileForBlog").fields([
  { name: "blogImage", maxCount: 1 },
  { name: "pdfFileForBlog", maxCount: 1 },
]),
blogController.updateUploadedBlog)

blog_route.delete("/delete-blog/:blogId", blogController.deleteUploadedBlog);

export default blog_route;
