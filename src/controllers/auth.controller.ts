import catchErrors from "../utils/catchErrors";
import { CREATED } from "../constants/http";
import { z } from "zod";
import { createAccount } from "../services/auth.service";
import { setAuthCookies } from "../utils/cookies";

const registerSchema = z
  .object({
    email: z.string().email().min(1).max(255),
    password: z.string().min(6).max(255),
    name: z.string().min(2).max(255),
    surname: z.string().min(2).max(255),
    confirmedPassword: z.string().min(6).max(255),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: "Passwords do not match",
    path: ["confirmedPassword"],
  });

export const registerHandler = catchErrors(async (req, res) => {
  const { email, password, name, surname, confirmedPassword } = req.body;
  // TODO: validate request body
  console.log({ email, password, name, surname, confirmedPassword });
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  //TODO: call service
  const { user, accessToken, refreshToken } = await createAccount({
    email: request.email,
    password: request.password,
    name: request.name,
    surname: request.surname,
    userAgent: request.userAgent,
  });
  //TODO: return response
  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user);
});
