import bcrypt from "bcrypt";

export const hashValue = async (value: string, saltRounds?: number) => {
  const salt = saltRounds || 8;

  return await bcrypt.hash(value, salt);
};

export const compareValue = async (value: string, hash: string) => {
  return await bcrypt.compare(value, hash).catch(() => false);
};
