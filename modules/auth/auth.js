import connection from "../../database/db.js";
import hashing from "./hashing.js";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import respondHanlder from "../controller/respondHandler.js";

export default function auth() {
  const router = express.Router();
  const db = connection;

  // token
  router.post("/token", async (req, res, next) => {
    const { username, password } = req.body;
    const validateUser = await db.query(
      "SELECT * from accounts where username = $1 ",
      [username]
    );

    if (!validateUser.rows[0]) {
      const err = new Error("username or password wrong");
      err.statusCode = 400;
      return next(err);
    }

    const hash = validateUser.rows[0].password.trim();

    const validateHash = await bcrypt.compare(password, hash);
    console.log(validateHash);

    try {
      const token = jwt.sign(
        { username: validateUser.rows[0].username },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );

      const respond = respondHanlder({ token: token }, 200, "Auth Completed");

      return res.status(200).json(respond);
    } catch (error) {
      error.statusCode = 500;
      return next(error);
    }
  });

  // // cookie
  // router.post("/cookie", (req, res, next) => {
  //   const request = req.body;

  //   try {
  //     const cookie = jwt.sign(
  //       { username: request, tokenId: cookieKey },
  //       process.env.SECRET_KEY,
  //       {
  //         expiresIn: "1d",
  //       }
  //     );

  //     res
  //       .cookie("AccessToken", cookie)
  //       .status(200)
  //       .json({ message: "Logged in successfully" });
  //   } catch (error) {
  //     next(error);
  //   }
  // });

  // verify
  router.get("/verify", (req, res, next) => {
    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];

    try {
      const result = jwt.verify(token, process.env.SECRET_KEY);
      console.log(result);
      res.send("success");
    } catch (error) {
      console.log("invalid key");
      res.send("invalid token");
    }
  });

  return router;
}
