import { ErrorRequestHandler, Response } from "express";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
import { z } from "zod";

const handleZodError = (error: z.ZodError, res: Response) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  res.status(BAD_REQUEST).json({
    message: error.message,
    errors,
  });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof z.ZodError) {
    handleZodError(error, res);
  }

  res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
};

export default errorHandler;
