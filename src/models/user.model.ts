import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  surname: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  omitPassword(): Pick<
    UserDocument,
    | "_id"
    | "email"
    | "name"
    | "surname"
    | "verified"
    | "createdAt"
    | "updatedAt"
  >;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return compareValue(candidatePassword, this.password);
};

userSchema.methods.omitPassword = function () {
  const user = this.toObject();
  delete user.password;

  return user;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
