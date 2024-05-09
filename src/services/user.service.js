import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import { validateEmail, validatePassword } from "../helper/helper.functions.js";
import { sendEmail } from "../utils/send.email.js";

//Generate Access and Refresh Tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong, while generating refresh and access token",
    );
  }
};

//Register User
const registerUser = async (userDetails) => {
  //TODO: Register a new User
  const { fullName, email, password, confirmedPassword, phoneNumber, role } =
    userDetails;

  if (!fullName || !email || !password || !confirmedPassword || !phoneNumber) {
    throw new apiError(400, "Missing fields are required");
  }

  const validateEmailCheck = validateEmail(email);
  if (!validateEmailCheck) {
    throw new apiError(400, "Provide valid email");
  }

  const validatePasswordCheck = validatePassword(password);
  if (!validatePasswordCheck) {
    throw new apiError(
      400,
      "One digit small, capital letter & must be special characters for password",
    );
  }

  // Check if password and confirmedPassword match
  if (password !== confirmedPassword) {
    throw new apiError(400, "Password and confirmed password must match");
  }

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    throw new apiError(400, "Email already exists");
  }

  // // Custom validation check for role
  // if (!["admin", "partner", "volunteer"].includes(role)) {
  //   throw new apiError(
  //     400,
  //     "Invalid role. Valid roles are: admin, partner, volunteer",
  //   );
  // }

  const user = await User.create({
    fullName,
    email,
    password,
    confirmedPassword,
    phoneNumber,
    role,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -confirmedPassword -refreshToken",
  );
  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }

  // Send the email to user who can register first
  const subject = "Welcome to Dagna.De!";

  const mesgForUserFromAdmin = `<p> Dear ${createdUser.fullName},</p>
  <p>Welcome aboard!  Your account has been successfully created, 
  and we're excited to see you engage with our platform.</p>

   <p>Best regards,</p>
   <p>Dagna.De</p>
  `;

  await sendEmail(createdUser.email, subject, mesgForUserFromAdmin);

  return createdUser;
};

//Login User
const loginUser = async (loginDetails) => {
  //TODO
  // req.body - data
  //username or email exists
  //find the user
  //check password
  //access & refresh token generation
  //send tokens in secure cookies

  const { email, password } = loginDetails;

  if (!(password || email)) {
    throw new apiError(400, "Email or password is required.");
  }

  const user = await User.findOne({ email: email, isActive: true }).select(
    "email isActive password",
  );
  if (!user) {
    throw new apiError(404, "Neither user exists nor is active.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -confirmedPassword -refreshToken",
  );

  return {
    loggedInUser,
    accessToken,
    refreshToken,
  };
};

//Logout User
const logoutUser = async (userId) => {
  //TODO: Logout User
  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid userId");
  }
  const logoutUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  if (!logoutUser) {
    throw new apiError(400, "User could not logout");
  }
  return logoutUser;
};

// Forgot Password
const forgetPassword = async (forgetDetails) => {
  //TODO: Forgot Password
  const { email } = forgetDetails;

  if (!email) {
    throw new apiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email }).select("email");
  if (!user) {
    throw new apiError(404, "User does not exists");
  }

  const resetToken = await user.getResetToken();
  console.log("reset token", resetToken);

  const subject = `Dagna De Reset Password`;
  const resetUrl = `${process.env.CLIENT_URL}/#/reset-password/${resetToken}`;

  const resetMessageAndLink = `Click on the link to reset your password. ${resetUrl}. If you 
  have not request then ignore it`;

  // send token via email
  await sendEmail(user.email, subject, resetMessageAndLink);

  return { resetMessageAndLink };
};

// Reset Password
const resetPassword = async (reset_token, newPassword, confirmedPassword) => {
  //TODO: Reset Password
  // Verify and decode the reset token
  let decodedToken;
  try {
    decodedToken = Jwt.verify(reset_token, process.env.RESET_TOKEN_KEY);
  } catch (error) {
    switch (error.constructor) {
      case Jwt.TokenExpiredError:
        throw new apiError(400, "Reset token has expired");
      case Jwt.JsonWebTokenError:
        throw new apiError(400, "Invalid reset token");
      default:
        throw new apiError(400, "Invalid reset token");
    }
  }

  // Ensure that the token was decoded successfully
  if (!decodedToken || !decodedToken._id) {
    throw new apiError(400, "Invalid reset token");
  }

  // Find the user by ID from decoded token
  const user = await User.findById(decodedToken._id).select("password");
  if (!user) {
    throw new apiError(400, "User not found");
  }

  if (!newPassword || !confirmedPassword) {
    throw new apiError(400, "New password and confirmed password are required");
  }

  if (newPassword !== confirmedPassword) {
    throw new apiError(400, "New password and confirmed password do not match");
  }

  // Validate new password
  const validatePasswordCheck = validatePassword(newPassword);
  if (!validatePasswordCheck) {
    throw new apiError(
      400,
      "One digit small, capital letter & must be special characters for password",
    );
  }
  // Update the user's password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // Update both the password and the confirmed password fields
  await User.findByIdAndUpdate(
    { _id: user._id },
    { password: hashedNewPassword, confirmedPassword: hashedNewPassword },
    { new: true },
  );

  return null;
};

// Get User Profile
const getSingleAndAllUserProfile = async (userId) => {
  //TODO: Get User Profile
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new apiError(400, "Invalid userId format");
    }
    const fetchedSingleUser = await User.findById(userId).select(
      "-password -confirmedPassword -refreshToken",
    );
    if (!fetchedSingleUser) {
      throw new apiError(404, "User does not exist");
    }
    return fetchedSingleUser;
  } else {
    const fetchedAllUsers = await User.find().select(
      "-password -confirmedPassword -refreshToken",
    );
    if (fetchedAllUsers.length == 0) {
      throw new apiError(404, "No users found");
    }
    return fetchedAllUsers;
  }
};

//Update User Status
const updateUserStatus = async (body, userId) => {
  // Validate user ID format
  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid UserId Format");
  }

  // Find the user by ID and select the isActive field
  const user = await User.findById(userId).select("isActive");
  if (!user) {
    throw new apiError(400, "User not found");
  }

  // Check if there are more than one key in body
  if (Object.keys(body).length !== 1) {
    throw new apiError(400, "Only one property for updation is allowed");
  }

  // Ensure only isActive property is allowed for updation
  if (!body.hasOwnProperty("isActive")) {
    throw new apiError(400, "Only isActive property for updation is allowed");
  }

  // Update the user's isActive property
  const updatedUserStatus = await User.findOneAndUpdate(
    { _id: userId },
    { $set: { isActive: body.isActive } },
    { new: true },
  ).select("isActive updatedAt");

  // Check if user status was successfully updated
  if (!updatedUserStatus) {
    throw new apiError(400, "Status could not be changed");
  }

  return updatedUserStatus;
};

//Update User info
const updateUserProfile = async (userDetails, UserId, userAvatarLocalPath) => {
  // TODO: Update User - FullName, Email and Avatar,
  // Ensure userDetails is provided and is an object

  if (!userDetails || typeof userDetails !== "object") {
    throw new apiError(400, "Invalid user details");
  }

  // Validate UserId
  if (!isValidObjectId(UserId)) {
    throw new apiError(400, "Invalid user ID");
  }

  // Find the user by ID
  const user = await User.findOne({ _id: UserId, isActive: true });

  if (!user) {
    throw new apiError(404, "User not Found");
  }

  // Update user's fullName if provided
  if (userDetails.fullName && userDetails.fullName.trim() !== "") {
    user.fullName = userDetails.fullName.trim();
  }

  // Update user's email if provided
  if (userDetails.email && userDetails.email.trim() !== "") {
    user.email = userDetails.email;
  }

  let updateUser;

  console.log("userAvatarLocalPath: ", userAvatarLocalPath);

  if (userAvatarLocalPath?.length > 0) {
    const uploadUserAvatar = await uploadOnCloudinary(
      userAvatarLocalPath,
      "User",
    );
    const deleteUserAvatar = await deleteOnCloudinary(
      user.avatar?.public_id,
      "image",
    );
    if (uploadUserAvatar.length > 0) {
      user.avatar = {
        url: uploadUserAvatar[0].url,
        public_id: uploadUserAvatar[0].public_id,
      };
    } else {
      throw new apiError(404, "User avatar not found");
    }
    updateUser = await User.updateOne(
      { _id: UserId },
      {
        $set: {
          ...user,
        },
      },
    );

    return new apiResponse(200, user, "User updated successfully.");
  } else {
    // Save the updated user
    updateUser = await user.save();
    if (!updateUser) {
      throw new apiError(500, "Failed to update User, try again");
    }
    return updateUser;
  }
};

//Get All User's Count
const getAllUsersCount = async () => {
  //TODO: Get All Users Count
  const totalUsers = await User.countDocuments();
  console.log("User Count: ", totalUsers);
  if (!totalUsers) {
    throw new apiError(404, "No users found");
  }

  return totalUsers;
};

//Delete User
const deleteUser = async (userId) => {
  //TODO: Delete User
  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid userId");
  }

  const findUser = await User.findById({ _id: userId });
  if (!findUser) {
    throw new apiError(400, "User not found");
  }
  const userDeletedOnCloudinary = await deleteOnCloudinary(
    findUser.avatar[0].public_id,
    "image",
  );

  if (!userDeletedOnCloudinary) {
    throw new apiError(400, "User could not deleted on cloudinary");
  }

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    throw new apiError(400, "User could not be deleted");
  }

  return deletedUser;
};

//Get Searched Users
const getSearchedUsers = async (query) => {
  const condition = {};

  // Check if the 'query' object is not empty
  if (Object.keys(query).length !== 0) {
    // Check if 'search' key exists in 'query' object
    if ("username" in query) {
      condition.username = { $regex: query.username, $options: "i" };
    }
    if ("fullName" in query) {
      condition.fullName = { $regex: query.fullName, $options: "i" };
    }
  }
  console.log("condition: ", condition);
  const users = await User.find(condition);
  return users;
};

//Refresh Access Token
const refreshAccessToken = async (incomingRefreshToken) => {
  //TODO: Refresh Access Token

  //If incomingRefreshToken not authorized, throw error
  if (!incomingRefreshToken) {
    throw new apiError(401, "unauthorized request");
  }

  try {
    const decodedToken = Jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_KEY,
    );

    const user = await User.findById(decodedToken?._id);

    console.log("user: ", user);

    //If User not found, throw error
    if (!user) {
      throw new apiError(401, "Invalid refresh token");
    }

    console.log("-----", incomingRefreshToken, user?.refreshToken);
    //Compare incoming and exiting refreshToken, if not matched, throw error
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refresh Token is Expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return { accessToken, newRefreshToken };
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh token");
  }
};

//Change User Password
const changeCurrentUserPassword = async (userId, oldPassword, newPassword) => {
  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid userId");
  }

  // Find user by userId
  const user = await User.findById(userId);

  // If user not found, throw error
  if (!user) {
    throw new apiError(400, "User not found");
  }

  // Check if old password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  // If old password is incorrect, throw error
  if (!isPasswordCorrect) {
    throw new apiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return user;
};

//Update User's Avatar
const updateUserAvatar = async (userId, avatarLocalPath) => {
  // If userId is not valid Object, throw error
  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid userId");
  }

  const user = await User.findById({ _id: userId });

  // If user not found, throw error
  if (!user) {
    throw new apiError(400, "User not found");
  }

  // If Avatar not found, throw error
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is missing");
  }

  // If Avatar not uploaded on Cloudinary, throw error
  const avatar = await uploadOnCloudinary(avatarLocalPath, "User");
  //If cloudinary did not return avatar's url, throw error
  if (!avatar.length) {
    throw new apiError(400, "Error while uploading avatar image");
  }

  //Update old Avatar with new one

  const updatedAvatar = await user.set({ avatar: avatar }).save();

  console.log("updatedAvatar: ", updatedAvatar);

  //If Avatar not updated, throw error
  if (!updatedAvatar) {
    throw new apiError(400, "Avatar Image could not upload successfully");
  }
  await deleteOnCloudinary(user.avatar[0].public_id, "image");

  return updatedAvatar;
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  updateUserProfile,
  getAllUsersCount,
  getSingleAndAllUserProfile,
  updateUserStatus,
  deleteUser,
  getSearchedUsers,
  refreshAccessToken,
  changeCurrentUserPassword,
  updateUserAvatar,
};
