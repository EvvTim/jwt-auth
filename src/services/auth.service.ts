import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import VerificationCodeTypes from "../constants/verificationCodeTypes";
import { ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from "../utils/date";
import SessionModel from "../models/session.model";
import { sendEmail } from "../utils/sendEmail";
import appAssert from "../utils/appAssert";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from "../constants/http";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from "../utils/jwt";
import { getVerifyEmailTemplate } from "../utils/emailTemplates";
import { APP_ORIGIN } from "../constants/env";

export type CreateAccountParams = {
  email: string;
  password: string;
  name: string;
  surname: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  //verify if email already exists
  const existingUser = await UserModel.exists({ email: data.email });
  appAssert(!existingUser, CONFLICT, "Email already exists");

  //create user
  const user = await UserModel.create({
    email: data.email,
    password: data.password,
    name: data.name,
    surname: data.surname,
  });

  const userId = user._id;

  //create verification code
  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeTypes.EMAIL,
    expiresAt: oneYearFromNow(),
  });
  //TODO: send verification email

  const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;
  const result = await sendEmail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });

  appAssert(result, INTERNAL_SERVER_ERROR, "Failed to send verification email");

  //create session
  const session = await SessionModel.create({
    userId,
    userAgent: data.userAgent,
  });

  //sign access token and refresh token
  const refreshToken = signToken(
    {
      sessionId: session._id,
    },
    refreshTokenSignOptions,
  );

  const accessToken = signToken({ userId, sessionId: session._id });

  //return user and tokens
  return { user: user.omitPassword(), accessToken, refreshToken };
};

export type LoginParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const loginUser = async ({
  email,
  password,
  userAgent,
}: LoginParams) => {
  //TODO: get user by email
  const user = await UserModel.findOne({ email });
  appAssert(user, UNAUTHORIZED, "Invalid email or password");

  const userId = user._id;
  //TODO: validate password from the request
  const isValidPassword = await user.comparePassword(password);
  appAssert(isValidPassword, UNAUTHORIZED, "Invalid email or password");

  //TODO: create session
  const session = await SessionModel.create({
    userId,
    userAgent,
  });

  const sessionInfo = {
    sessionId: session._id,
  };

  //TODO: sign access token and refresh token
  const refreshToken = signToken(sessionInfo, refreshTokenSignOptions);
  const accessToken = signToken({ ...sessionInfo, userId });

  //TODO: return user and tokens

  return { user: user.omitPassword(), accessToken, refreshToken };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await SessionModel.findById(payload.sessionId);
  const now = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    "Session expired",
  );

  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;

  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(
        {
          sessionId: session._id,
        },
        refreshTokenSignOptions,
      )
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id,
  });

  return { accessToken, newRefreshToken };
};

export const verifyEmail = async (code: string) => {
  //TODO: get verification code
  const validCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeTypes.EMAIL,
    expiresAt: { $gt: new Date() },
  });

  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  //TODO: update user to verified true
  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    {
      verified: true,
    },
    { new: true },
  );
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");
  //TODO: delete verification code
  await validCode.deleteOne();
  //TODO: return user
  return {
    user: updatedUser.omitPassword(),
  };
};
