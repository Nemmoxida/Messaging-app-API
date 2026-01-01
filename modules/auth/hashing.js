import bcrypt from "bcrypt";

export default function hashing(password) {
  if (!password) {
    throw new Error("No password detected");
  }
  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);

  return hash;
}
