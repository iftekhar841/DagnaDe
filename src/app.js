import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Use morgan middleware with the "dev" format
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes imports
import user_route from "./routes/user.route.js";
import contact_route from "./routes/contact.route.js";
import blog_route from "./routes/blog.route.js";

//routes declaration
app.use("/api/v1/users", user_route);
app.use("/api/v1/contacts", contact_route);
app.use("/api/v1/blogs", blog_route);

//http://localhost:8000/api/v1/users/register

export { app };
