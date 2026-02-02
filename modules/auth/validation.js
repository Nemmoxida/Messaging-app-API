import { AppError } from "../../middlerware/customErrorObject.js";
import jwt from "jsonwebtoken";

export default function validation() {
  return (req, res, next) => {
    const tokenBearer = req.headers.authorization;
    const token = tokenBearer.split(" ")[1];

    if (!tokenBearer || !token) {
      return next(new AppError("Unautorize no token detected", 401));
    }

    try {
      const verify = jwt.verify(token, process.env.SECRET_KEY);
      req.username = verify.username;
      req.id = verify.id;

      next();
    } catch (error) {
      return next(new AppError("Unautorize invalid token", 401));
    }
  };
}
