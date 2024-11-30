import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import VerificationCodeTypes from "../constants/verificationCodeTypes";
import { oneYearFromNow } from "../utils/date";
import SessionModel from "../models/session.model";
import appAssert from "../utils/appAssert";
import { CONFLICT, UNAUTHORIZED } from "../constants/http";
import { refreshTokenSignOptions, signToken } from "../utils/jwt";

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
