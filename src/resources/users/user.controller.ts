import {Request} from 'express';
import {
  _allCoordinatorsService,
  _deleteAccount,
  _deleteCoordinatorsService,
  _forgotPassword,
  _login,
  _refreshToken,
  _resendOTP,
  _resetOtp,
  _resetPassword,
  _signup,
  _updatePassword,
  _updateProfile,
  _verifyAccount, changePasswordService, totalUsersService,
  unboardingService,
} from './user.service';
import {CustomError, CustomResponse} from '../../helpers/lib/App';
import {LoginDTO} from './user.dtos';
import {BrevoContactPayload, UnVerifiedUserDto} from './user.interface';
import {StatusCodes} from 'http-status-codes/build/cjs/status-codes';
import userModel from './user.model';

export const signupController = async (req: Request, res: CustomResponse<any>) => {
  const payload = {
    ...req.body,
    ip: req.body.ip as any,
    referrerCode: req.body.referrerCode,
  }
  const message = await _signup(payload)
  res.json({
    msg: "user created successfully",
    data: message,
    statusCode: StatusCodes.CREATED
  })
}

export const verifyAccountController = async (req: Request, res: CustomResponse<any>) => {
  const data = await _verifyAccount(req.body.email, req.body.otp)
  res.cookie('refresh_token', data.tokens.refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  })

  res.json({
    data: { user: data.user, token: data.tokens.accessToken }
  })
}

export const resendOTPController = async (req: Request, res: CustomResponse<any>) => {
  const message = await _resendOTP(req.body.email, req.body.otpType)

  res.json({ data: { message } })
}

export const forgotPasswordController = async (req: Request, res: CustomResponse<any>) => {
  const message = await _forgotPassword(req.body.email)

  res.json({ data: { message } })
}

export const resetPasswordController = async (req: Request, res: CustomResponse<any>) => {
  const message = await _resetOtp(req.body.email, req.body.otp, req.body.new_password)

  res.json({ data: { message } })
}
export const actual_resetPasswordController = async (req: Request, res: CustomResponse<any>) => {
  const payload = {
    new_password: req.body.password,
  }
  const message = await _resetPassword(req.body.email, payload.new_password)
  res.json({ data: { message } })
}
export const loginController = async (req: Request, res: CustomResponse<any>) => {
  const data = await _login(req.body.email, req.body.password)

  let verifiedUser = data as LoginDTO
  let unverifiedUser = data as UnVerifiedUserDto

  if (verifiedUser.user) {
    res.cookie('refresh_token', verifiedUser.tokens.refreshToken,
      {
        httpOnly: true,
        sameSite: 'none',
        // secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        secure:true
      })
    res.json({
      data: { user: verifiedUser.user, token: verifiedUser.tokens.accessToken }
    })
  } else {
    res.json({ data: unverifiedUser })
  }
}
export const getProfileController = async (req: Request, res: CustomResponse<any>) => {
  const response = await userModel.findById(req.user._id).populate("referralCode", "referralCode").lean()
  res.json({
    data: { user: { ...response, password: undefined } }
  })
}
export const getAdminProfileController = async (req: Request, res: CustomResponse<any>) => {
  const response = await userModel.findById(req.query.id).lean()
  res.json({
    data: { user: { ...response, password: undefined } }
  })
}
export const updateProfileController = async (req: Request, res: CustomResponse<any>) => {
  const userId =  req.user._id
  const payload = {
    ...req.body,
    profile_image: req.file
  }
  const data = await _updateProfile(userId as any, payload)
  res.status(200).json({ data, msg: "Successful" })
}
export const updateAdminProfileController = async (req: Request, res: CustomResponse<any>) => {
  const userId = req.params.id 
  const data = await _updateProfile(userId as any, req.body)
  res.status(200).json({ data, msg: "Successful" })
}
export const unboardingController = async (req:Request, res:CustomResponse<any>)=>{
  const payload = {
    country : req.body.country,
    state: req.body.state,
    city: req.body.city,
    postalCode: req.body.postalCode,
    userId: req['user']._id
  }
  const data = await unboardingService(payload)
  res.status(200).json({ data, msg: "Successful" })
}
export const changePasswordController = async (req: Request, res: CustomResponse<any>) => {
  const userId =  req.user._id
  const payload = {
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
    userId: userId
  }
  if(!payload.currentPassword  || !payload.newPassword){
    throw new CustomError({
      message: "Either Current Password || New Password is missing",
      code: StatusCodes.BAD_REQUEST
    })
  }
  const data = await changePasswordService(payload);
  res.json({ data, msg: "Successful" })
}
// export const updateProfileImageController = async (req: Request, res: CustomResponse<any>) => {
//   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
//   let file: any = {}

//   if (!files || !files["profile_image"]) throw new CustomError({ message: "Please Provide a Profile Image" })

//   if (files && files['profile_image']) {
//     file.buffer = files['profile_image'][0].buffer
//     file.mimetype = files['profile_image'][0].mimetype
//   }


//   const data = await _updateProfilePhoto(file, req.user._id)

//   res.status(200).json({ data, msg: "Successful" })
// }

export const updatePasswordController = async (req: Request, res: CustomResponse<any>) => {
  const data = await _updatePassword(req.user._id, req.body.old_password, req.body.new_password)

  res.cookie('refresh_token', data.refresh_token, {
    httpOnly: true,
    sameSite: 'none',
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  })
  res.json({ data: { token: data.access_token } })
}

// export const addShippingAddressController = async (req: Request, res: CustomResponse<any>) => {
//   const data = await _addShippingAddress(req.user._id, req.body.addresses)

//   res.status(200).json({ data, msg: "Successful" })
// }

// export const deleteShippingAddressController = async (req: Request, res: CustomResponse<any>) => {
//   const data = await _deleteShippingAddress(req.user._id, req.body.index)

//   res.status(200).json({ data, msg: "Successful" })
// }

export const deleteAccountController = async (req: Request, res: CustomResponse<any>) => {
  const data = await _deleteAccount(req.user._id, req.body.password)
  res.cookie('refresh_token', data.refresh_token, { httpOnly: true })

  res.json({ data })
}

export const logoutController = async (req: Request, res: CustomResponse<any>) => {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  res.status(204).json({ data: null, statusCode: 204 });
};


export const refreshTokenController = async (req: Request, res: CustomResponse<any>) => {
  const refresh_token = req.cookies?.refresh_token ? req.cookies.refresh_token : ''
  const tokens = await _refreshToken(refresh_token)

  res.cookie('refresh_token', tokens.refresh_token, {
    httpOnly: true,
    sameSite: 'none',
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  })

  res.status(200).json({ data: { token: tokens.access_token }, statusCode: 200 })
}
export const totalUsersController = async (req:Request, res:CustomResponse<any>) => {
  const data = await totalUsersService()
  res.json({ data, msg: "Successful" })
}
