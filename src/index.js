import dotenv from "dotenv";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server is running at PORT: ${PORT}`));
  })
  .catch((error) => {
    console.log("MongoBD connection Failed!!! ", error);
  });  
