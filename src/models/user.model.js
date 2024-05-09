import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    confirmedPassword: {
      type: String,
      required: [true, "Confirm Password is required"],
    },
    phoneNumber: {
      type: Number,
      default: 0
    },
    role: {
      type: String,
      enum: ['admin', 'partner', 'volunteer', "user"],
      default: 'user' // Set default role as volunteer
    },
    refreshToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmedPassword = await bcrypt.hash(this.confirmedPassword, 10); // Hash confirmed password
    next();
});



userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.getResetToken = function() {
 return jwt.sign(
    {
      _id: this._id,
    },
    process.env.RESET_TOKEN_KEY,
    {
      expiresIn: process.env.RESET_TOKEN_EXPIRY,
    }
  );
}

export const User = mongoose.model("User", userSchema);
