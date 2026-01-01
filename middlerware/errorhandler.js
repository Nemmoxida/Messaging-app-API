import { v7 as uuidv7 } from "uuid";

export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const requestId = uuidv7();
  const requestTime = new Date().toISOString();

  console.log(err);

  return res.status(statusCode).json({
    status: "Failed",
    statusCode: statusCode,
    message: err.message,
    timeStamp: requestTime,
    requestId: requestId,
  });
}
