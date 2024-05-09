import mongoose, { Schema } from "mongoose";

const blogSchema = new Schema({
    blogAuthorName: {
        type: String,
        required: true
    },
    blogTitle: {
        type: String,
        required: true
    },
    blogDescription: {
        type: String,
        required: true
    },
    blogImage: {
        type: String,
        required: true  
    },
    pdfFileForBlog: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
 { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;