import connection from "../../database/db.js";
import hashing from "./hashing.js";
import { v7 as uuidv7 } from "uuid";

export default async function signUp(req, res, next) {
  const payload = req.body;
  if (!payload.username || !payload.password || !payload) {
    const err = Error("No password or username detected");
    err.statusCode = 400;
    return next(err);
  }

  const hash = hashing(payload.password);
  const db = connection;
  try {
    const data = await db.query(
      "INSERT INTO accounts(username, password) VALUES($1, $2)",
      [payload.username, hash]
    );
    const requestId = uuidv7();
    const requestTime = new Date().toISOString();

    return res.json({
      status: "success",
      statuscode: 200,
      message: "Data recieved and saved successfully",
      timeStamp: requestTime,
      requestId: requestId,
    });
  } catch (error) {
    next(error);
  }
}
