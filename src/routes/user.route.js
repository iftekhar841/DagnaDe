import { Router } from "express";
// import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import userController from "../controllers/user.controller.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  getAllUsersCount,
  getSingleAndAllUserProfile,
  updateUserStatus,
  deleteUser,
  getSearchedUsers,
  refreshAccessToken,
  changeCurrentUserPassword,
  updateUserProfile,
  updateUserAvatar,
} from "../controllers/user.controller.js";

const user_route = Router();

user_route.post("/register", registerUser);

user_route.post("/login", loginUser);

// secured routes
user_route.post("/logout", verifyJWT, logoutUser)

user_route.post("/forget-password", forgetPassword);

user_route.put("/reset-password/:reset_token", resetPassword);

//Get User Profile
user_route.get("/user-profile", getSingleAndAllUserProfile);

//Change User status (isActive)
user_route.patch('/update-status/:userId', updateUserStatus);

//Update User
user_route.patch("/update/:id",
  // upload.array({ name: "avatar", maxCount: 1 }),  
  updateUserProfile);

//Get Users count
user_route.get("/total-users", getAllUsersCount);


//Delete User permanently
user_route.delete("/delete/:id", deleteUser)

//Search User
user_route.get("/search-user", getSearchedUsers)

// Refresh Access Token
user_route.post("/refresh-token", refreshAccessToken);

//Change Password
user_route.post("/change-password", verifyJWT, changeCurrentUserPassword);

user_route.patch("/change-avatar", verifyJWT, 
// upload.single("avatar"),
 updateUserAvatar);

export default user_route;  
