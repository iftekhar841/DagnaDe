import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    //console.log("token: " + token);

    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      //Todo
      throw new apiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(
        new apiError(error.statusCode, error.message || "Invalid access token")
      );
  }
});
