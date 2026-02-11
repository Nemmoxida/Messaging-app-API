import { userSocketMap } from "../websocket/handler/handlerMap.js";
import connection from "../../database/db.js";
import respondHandler from "../websocket/handler/respondHandlerWS.js";

const db = connection;

export default async function notifyUserWs(memberId, groupId, event, message) {
  const notifyUser = userSocketMap.get(memberId);

  if (notifyUser) {
    const getGroupName = await db.query(
      "SELECT name FROM groups WHERE id = $1",
      [groupId],
    );

    const respondWs = respondHandler({
      event: `Group: ${event} `,
      status: "success",
      message: `${message} ${getGroupName.rows[0].name}`,
      data: {
        id: groupId,
        name: getGroupName.rows[0].name,
        image: null,
      },
    });
    notifyUser.send(JSON.stringify(respondWs));
  }

  return;
}
