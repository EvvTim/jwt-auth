import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import VerificationCodeTypes from "../constants/verificationCodeTypes";
import { oneYearFromNow } from "../utils/date";
import SessionModel from "../models/session.model";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import jwt from "jsonwebtoken";

export type CreateAccountParams = {
  email: string;
  password: string;
  name: string;
  surname: string;
  userAgent?: string;
};

export const createAccount = async (data: CreateAccountParams) => {
  console.log("Creating account with data:", data, "...");
  //TODO: verify existing user doesnt exist
  const existingUser = await UserModel.exists({ email: data.email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  //TODO: create user
  const user = await UserModel.create({
    email: data.email,
    password: data.password,
    name: data.name,
    surname: data.surname,
  });
  //TODO: create verification code

  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeTypes.EMAIL,
    expiresAt: oneYearFromNow(),
  });
  //TODO: send verification email
  //TODO: create session on system
  const session = await SessionModel.create({
    userId: user._id,
    userAgent: data.userAgent,
  });

  //TODO: sign access token and refresh token
  const refreshToken = jwt.sign(
    { sessionId: session._id },
    JWT_REFRESH_SECRET,
    { expiresIn: "30d", audience: ["user"] },
  );

  const accessToken = jwt.sign(
    { userId: user._id, sessionId: session._id },
    JWT_SECRET,
    {
      expiresIn: "15m",
      audience: ["user"],
    },
  );
  //TODO: return user and tokens
  return { user, accessToken, refreshToken };
};
