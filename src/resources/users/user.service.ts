import userModel from "./user.model";
import UserModel from "./user.model";
import {
  BrevoContactPayload,
  IDeleteAccount,
  IForgotPassword,
  ILogin,
  IResendOTP,
  IResetPassword,
  ISignup,
  IUpdatePassword,
  IVerifyAccount,
} from "./user.interface";
import {SignupDTO} from "./user.dtos";
import {createToken, CustomError, EmailService, verifyToken} from "../../helpers/lib/App";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import {redis_client} from "../../app";
import {ResendOTPType} from "../../helpers/constants";
import {StatusCodes} from "http-status-codes";
import {uploadFilePathToCloudinary} from "../../utils/cloudinary";
import fs from "node:fs/promises";
import mongoose from "mongoose";
import axios, {HttpStatusCode} from "axios";

const handleMongoError = (error: any): never => {
  // E11000 duplicate key error
  if (error.code === 11000 || error.name === 'MongoServerError') {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    throw new CustomError({
      message: `${field} already exists. Please use a different ${field}.`,
      code: StatusCodes.CONFLICT,
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');
    throw new CustomError({
      message: `Validation failed: ${messages}`,
      code: StatusCodes.BAD_REQUEST,
    });
  }

  // Cast errors (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    throw new CustomError({
      message: `Invalid ${error.path}: ${error.value}`,
      code: StatusCodes.BAD_REQUEST,
    });
  }

  // Re-throw if already a CustomError
  if (error instanceof CustomError) {
    throw error;
  }

  // Generic error
  throw new CustomError({
    message: 'An error occurred during signup',
    code: StatusCodes.INTERNAL_SERVER_ERROR,
  });
};
export const _signup: ISignup = async (data: SignupDTO) => {
  try {
    //check if email already exist
    const emailExist = await userModel.findOne({ email: data.email, name:data.business_name}).lean().exec()
    if (emailExist){
      throw new CustomError({
        message: "email or user already exist",
        code: StatusCodes.CONFLICT,
      });
    }
    const newPayload = {
      ...data
    }
    //save user
    const user = await userModel.create({
      ...newPayload,
      password: await bcrypt.hash(data.password, 10),
    });

    //generate otp
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    console.log(otp);
    //send otp to user email
    await new EmailService().sendOTP(
        "Account Verification",
        user.email,
        user.name,
        otp
    );

    console.log("otp sent to mail", otp);
    //save otp in memory
    const client = await redis_client.getRedisClient();
    client.set(user.email, await bcrypt.hash(otp, 10), "EX", 60 * 10);
    //return message
    return "check Email. OTP sent";
  }catch(error:any){
    console.error('[SIGNUP ERROR]:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });

    // Handle MongoDB-specific errors
    if (error.code === 11000 || error.name === 'MongoServerError' || error.name === 'ValidationError') {
      handleMongoError(error);
    }

    // Re-throw CustomError as-is
    if (error instanceof CustomError) {
      throw error;
    }

    // Wrap unknown errors
    throw new CustomError({
      message: error.message || "An unexpected error occurred during signup",
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
  }

export const _verifyAccount: IVerifyAccount = async (user_email, otp) => {
  const client = await redis_client.getRedisClient();

  const hashed_otp = await client.get(user_email);

  // console.log(hashed_otp);

  if (!hashed_otp)
    throw new CustomError({
      message: "OTP is either incorrect or has expired.",
      code: StatusCodes.UNAUTHORIZED,
    });

  if (!(await bcrypt.compare(otp, hashed_otp)))
    throw new CustomError({
      message: "OTP is either incorrect or has expired.",
      code: StatusCodes.UNAUTHORIZED,
    });

  // const user = await userModel.findOneAndUpdate({is_verified: true}, {email: user_email})
  const user = await userModel.findOne({ email: user_email });
  if (!user)
    throw new CustomError({
      message: "OTP is either incorrect or has expired.",
      code: StatusCodes.UNAUTHORIZED,
    });

  user.is_verified = true;
  await user.save();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user_email)) {
    console.log("Invalid email format");
    throw new CustomError({
      message:"Invalid email format",
      code: StatusCodes.BAD_REQUEST
    })
  }
  // //send welcome Email
  await new EmailService().welcome(
    "Welcome To Travelvas",
    user.email,
    user.name.split(" ")[0]
  );
  await client.del(user.email);

  const accessToken = createToken(user.id, user.role, "1d");
  const refreshToken = createToken(user.id, user.role, "30d");

  const data = user.toObject({
    transform: (doc, ret) => {
      delete ret.password;
    },
  });

  return {
    user: data,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

export const _resendOTP: IResendOTP = async (
  user_email: string,
  otpType: ResendOTPType
) => {
  const user = await userModel.findOne({ email: user_email });

  if (!user) throw new CustomError({ message: "Email not found", code: 404 });
  //generate otp
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const client = await redis_client.getRedisClient();
  await client.set(user_email, await bcrypt.hash(otp, 10), "EX", 60 * 10);

  //send otp to email
  console.log(otp);
  await new EmailService().sendOTP(
    otpType,
    user.email,
     user.name.split(" ")[0],
    otp
  );

  return "OTP sent to email.";
};

export const _forgotPassword: IForgotPassword = async (user_email) => {
  const user = await userModel.findOne({ email: user_email });

  if (!user) throw new CustomError({ message: "Email not found", code: 400 });

  const client = await redis_client.getRedisClient();

  //generate otp
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  await client.set(user_email, await bcrypt.hash(otp, 10), "EX", 60 * 10);

  //send otp to email
  console.log(otp);
  await new EmailService().sendOTP(
    "Forgot Password",
    user.email,
    user.name ?? "",
    otp
  );

  return "OTP sent to email.";
};

export const _resetOtp: IResetPassword = async (
  user_email,
  otp,
  new_password
) => {
  const client = await redis_client.getRedisClient();

  const hashed_otp = await client.get(user_email);

  // console.log(hashed_otp, otp);

  if (!hashed_otp)
    throw new CustomError({ message: "OTP has expired", code: 401 });

  if (!(await bcrypt.compare(otp, hashed_otp)))
    throw new CustomError({ message: "OTP is invalid", code: 401 });

  const user = await userModel.findOneAndUpdate(
    { email: user_email },
    { password: new_password }
  );

  if (!user)
    throw new CustomError({ message: "OTP has expired or invalid", code: 401 });

  await client.del(user.email);

  return "Otp Updated Successfully.";
};

export const _resetPassword = async (
    user_email: string,
    new_password: string,
)=>{
  const hashedPassword = await bcrypt.hash(new_password, 10);
  const user = await userModel.findOneAndUpdate(
      { email: user_email },
      { password: hashedPassword }
  );
  if(!user){
    throw new CustomError({
      message: 'User not found',
      code: StatusCodes.BAD_REQUEST,
    })
  }
  return "Password updated successfully"
}
/**
 *
 * @param email
 * @param password
 */
export const _login: ILogin = async (email, password) => {
  if (!password || !email)
    throw new CustomError({
      message: "username or password is required",
      code: StatusCodes.BAD_REQUEST,
    });
  const user = await userModel.findOne({ email: email }).populate("referralCode");
    // console.log(user)
  if (!user)
    throw new CustomError({
      message: "username or password is incorrect",
      code: StatusCodes.UNAUTHORIZED,
    });

  // if(!(await bcrypt.compare(password, user.password))) throw new CustomError({message: 'username or password is incorrect', code: 401})
  if (!(await bcrypt.compare(password, user.password!)))
    throw new CustomError({
      message: "username or password is incorrect",
      code: 401,
    });

  if (!user.is_verified) {
    return {
      email: user.email,
      message: "Verify your account to start your journey",
    };
  }
  if(user.isSuspended){
    throw new CustomError({
      message: "User account is temporarily suspended",
      code: StatusCodes.UNAUTHORIZED
    })
  }

  //generate tokens
  const accessToken = createToken(user._id, user.role, "1d");
  const refreshToken = createToken(user._id, user.role, "30d");

  // const data = user.toObject({ transform: (doc, ret) => { delete ret.password; } });
  const data = user.toObject({
    transform: (doc, ret) => {
      delete ret.password;
    },
  });

  // handle subscription
  return {
    user: data,
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};
export const _updateProfile:any = async (user_id:any, data: any) => {
  // Create a copy of the data object to modify
  const updateData = { ...data };

  // Handle profile image upload if provided
  const thumbnailFile = data.profile_image as Express.Multer.File;
  const newFiles = [];
 if(thumbnailFile){
   try {
     const originalUpload = await uploadFilePathToCloudinary(thumbnailFile.path, "profile_pictures");

     if (!originalUpload || !originalUpload.secure_url) {
       throw new Error('Cloudinary upload failed or returned invalid data');
     }

     const watermarkedUrl = originalUpload.secure_url;

     newFiles.push({
       url: watermarkedUrl,
       name: thumbnailFile.originalname || 'unnamed-file',
       size: thumbnailFile.size || 0,
       type: thumbnailFile.mimetype || 'application/octet-stream'
     });

     // Clean up temp file
     try {
       await fs.unlink(thumbnailFile.path);
     } catch (unlinkErr) {
       console.error(`Warning: Error deleting temp file: ${unlinkErr}`);
     }

   } catch (error: any) {
     if (thumbnailFile.path) {
       try {
         await fs.unlink(thumbnailFile.path).catch(() => {});
       } catch {
         // Silently ignore cleanup errors
       }
     }

     console.error(`Error processing thumbnail file: ${error}`);
     throw new CustomError({
       message: `Error processing thumbnail file: ${error.message}`,
       code: StatusCodes.INTERNAL_SERVER_ERROR
     });
   }
 }

const newPayload = {
   ...updateData,
  profile_image: newFiles,
}
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }
  if(data.country){
    updateData.country = data.country
  }
  if(data.business_country){
    updateData.business_country = data.business_country
  }

  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined || updateData[key] === null) {
      delete updateData[key];
    }
  });

  const response = await userModel
      .findOneAndUpdate({ _id: user_id }, newPayload, {
        new: true,
      })
      .select("-password");
  return response
};
export const _updatePassword: IUpdatePassword = async (
  user_id,
  old_password,
  new_password
) => {
  const user = await userModel.findOne({ _id: user_id }, { __v: 0 });

  if (!user)
    throw new CustomError({ message: "Unauthorized access", code: 401 });

  if (!user.password)
    throw new CustomError({
      message: "Unauthorized access. You registered with google",
      code: 401,
    });
  if (!(await bcrypt.compare(old_password, user.password)))
    throw new CustomError({ message: "Password not correct", code: 401 });

  await userModel.findOneAndUpdate(
    { _id: user_id },
    { password: await bcrypt.hash(new_password, 10) }
  );

  //generate tokens
  const accessToken = createToken(user.id, user.role, "60m");
  const refreshToken = createToken(user.id, user.role, "30d");

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  };
};

export const _deleteAccount: IDeleteAccount = async (user_id, password) => {
  const user = await userModel.findOne({ _id: user_id }, { __v: 0 });

  if (!user)
    throw new CustomError({ message: "Unauthorized access", code: 401 });

  if (user.password) {
    if (!(await bcrypt.compare(password, user.password)))
      throw new CustomError({ message: "Unauthorized access", code: 401 });
  }

  await userModel.findOneAndUpdate({ status: false }, { _id: user_id });

  return { refresh_token: "null" };
};

export const _refreshToken = async (refresh_token: string) => {
  try {
    const decoded = await verifyToken(refresh_token);

    if (decoded instanceof jwt.JsonWebTokenError) {
      throw new CustomError({
        message: "access token invalid",
        code: 401,
        ctx: { data: "invalid bearer token" },
      });
    }
    const user = await userModel.findOne({ _id: decoded.id });
    if (!user) {
      throw new CustomError({
        message: "access token invalid",
        code: 401,
        ctx: { data: "invalid bearer token" },
      });
    }

    return {
      access_token: createToken(user.id, user.role, "60m"),
      refresh_token: createToken(user.id, user.role, "30d"),
    };
  } catch (e) {
    throw new CustomError({
      message: "access token invalid",
      code: 401,
      ctx: { data: "invalid bearer token" },
    });
  }
};

export const _allCoordinatorsService = async (page?:any)=>{
  const data =  await userModel.find().exec()
  // console.log(data)
  const promised:any = []
  for(const item of data){
    if(item.isDeleted === false){
     promised.push(item)
    }
  }
  return promised
}

export const _deleteCoordinatorsService = async (id:any, flag:string, deletes:any)=>{
  const isExist = await userModel.findOne({_id: id}).lean().exec()
  if(!isExist){
    throw new CustomError({
      message: "user not found",
      code: 404,
      ctx: { data: "invalid id provided" },
    });
  }
  console.log(flag)
  if(flag && flag === 'false'){
    console.log(flag)
    isExist.isDeleted = false; 
    await userModel.findByIdAndUpdate(id, { isDeleted: false }, { new: true }).lean().exec();
  }else if(deletes){
    await userModel.findByIdAndDelete(id).lean().exec();
  }else{
    isExist.isDeleted = true;
    await userModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean().exec();
  }
   // Assuming isDeleted is a field in your user schema
  return isExist;
}
export const unboardingService = async (payload: {
  country: any;
  state: any;
  city: any;
  postalCode: any;
  userId: any;
}) => {
  try {
    const userDetails = await UserModel.findOne({
      _id: payload.userId,
      $or: [
        { country: { $in: [null, ''] } },
        { state: { $in: [null, ''] } },
        { city: { $in: [null, ''] } }
      ]
    }).lean().exec();

    if (!userDetails) {
      throw new CustomError({
        message: "User not found or user already has complete location data",
        code: StatusCodes.BAD_REQUEST,
      });
    }

    // Update the user with the provided payload
    const response = await UserModel.findByIdAndUpdate(
        payload.userId,
        {
          country: payload.country,
          state: payload.state,
          city: payload.city,
          postalCode: payload.postalCode,
          isUnboarded: true,
        },
        { new: true }
    );

    return response;

  } catch (error: any) {
    console.log(error);
    throw new CustomError({
      message: error.message,
      code: error.code || StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
export const changePasswordService = async (payload: {
  currentPassword: string;
  newPassword: string;
  userId: string;
}) => {
  try {
    // Find the user by ID
    const user = await userModel.findById(payload.userId).select("+password");
    
    if (!user) {
      throw new CustomError({
        message: "User not found",
        code: StatusCodes.NOT_FOUND,
      });
    }

    // Check if user has a password (not registered with Google/social login)
    if (!user.password) {
      throw new CustomError({
        message: "Cannot change password. Account registered with social login.",
        code: StatusCodes.BAD_REQUEST,
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      payload.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new CustomError({
        message: "Current password is incorrect",
        code: StatusCodes.UNAUTHORIZED,
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(
      payload.newPassword,
      user.password
    );

    if (isSamePassword) {
      throw new CustomError({
        message: "New password must be different from current password",
        code: StatusCodes.BAD_REQUEST,
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(payload.newPassword, 10);

    // Update the user's password
    await userModel.findByIdAndUpdate(
      payload.userId,
      { password: hashedNewPassword },
      { new: true }
    );

    // Generate new tokens for security
    const accessToken = createToken(user._id, user.role, "1d");
    const refreshToken = createToken(user._id, user.role, "30d");

    return {
      message: "Password changed successfully",
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  } catch (error: any) {
    // If it's already a CustomError, re-throw it
    if (error instanceof CustomError) {
      throw error;
    }
    
    // Otherwise, wrap it in a CustomError
    throw new CustomError({
      message: error.message || "Failed to change password",
      code: error.code || StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
export const totalUsersService = async ()=> {
    try {
      const response = await UserModel.find()
      return response
    }catch(error:any){
      console.log(error)
      throw new CustomError({
        message: error.message,
        code: error.code,
      })
    }
}