import { v7 as uuidv7 } from "uuid";

export default function respondHandler(payload) {
  const requestId = uuidv7();
  const requestTime = new Date().toISOString();

  const respond = {
    event: payload.event,
    status: payload.status,
    message: payload.message,
    data: payload.data != undefined ? payload.data : {},
    meta: {
      timeStamp: requestTime,
      requestId: requestId,
    },
  };

  return respond;
}
