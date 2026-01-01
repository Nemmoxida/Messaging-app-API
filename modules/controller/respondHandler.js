import { v7 as uuidv7 } from "uuid";

export default function respondHanlder(data, statusCode = 200, message) {
  const requestId = uuidv7();
  const requestTime = new Date().toISOString();

  const res = {
    status: "success",
    statusCode: statusCode,
    message: message || " ",
    data: data,
    timeStamp: requestTime,
    requestId: requestId,
  };

  return res;
}
