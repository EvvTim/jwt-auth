import catchErrors from "../utils/catchErrors";
import { CREATED, OK } from "../constants/http";
import { createAccount, loginUser } from "../services/auth.service";
import { setAuthCookies } from "../utils/cookies";
import { loginSchema, registerSchema } from "./auth.schemas";

export const registerHandler = catchErrors(async (req, res) => {
  // TODO: validate request body
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

export const loginHandler = catchErrors(async (req, res) => {
  //TODO: validate request body
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  //TODO: call service
  const { accessToken, refreshToken } = await loginUser(request);

  //TODO: return response
  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "Login successful" });
});
