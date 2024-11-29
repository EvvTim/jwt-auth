import express from "express";
import "dotenv/config";
import cors from "cors";
import { APP_ORIGIN, HOST, NODE_ENV, PORT } from "./constants/env";
import connectToDatabase from "./config/db";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());

app.get("/", (req, res, next) => {
  res.status(OK).json({
    status: "healthy",
  });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

app.listen(PORT, HOST, async () => {
  console.log(
    `Server is running on http://${HOST}:${PORT} in ${NODE_ENV} mode`,
  );

  await connectToDatabase();
});