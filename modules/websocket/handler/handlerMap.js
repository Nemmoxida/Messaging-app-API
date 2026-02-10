import connection from "../../../database/db.js";
import dbHandler from "./dbHandler.js";
import respondHandler from "./respondHandlerWS.js"; // respond format

export const socketUserMap = new Map();
export const onlineGroupMembers = new Map(); // for listing a member that's online in spesific groups
export const userOnlineGroups = new Map();
export const userSocketMap = new Map();

let clientData; // for searching the clientData

const handlers = {
  // Setting socketUserMap name or ID (basically login)
  setName: async (socket, payload) => {
    const db = connection;
    const validation = await db.query(
      "SELECT username,id FROM accounts WHERE username = $1",
      [payload],
    );
    if (!validation.rows) {
      return socket.send("Invalid username");
    }
    socketUserMap.set(socket, { userName: payload, id: validation.rows[0].id });
    userSocketMap.set(validation.rows[0].id, socket);
    const respond = respondHandler({
      event: "auth:login",
      status: "success",
      message: `Your name is now set to ${payload}`,
    });

    // getting user groups data
    const getUserGroupData = await dbHandler.dbAddOnlineMemberGroup(
      validation.rows[0].id,
    );

    // adding member to cache for user group list
    for (const membership of getUsermembership) {
      if (!onlineGroupMembers.get(membership.group_id)) {
        onlineGroupMembers.set(
          membership.group_id,
          new Map([[membership.user_id, socket]]),
        );
      }

      if (!userOnlineGroups.get(membership.user_id)) {
        userOnlineGroups.set(
          membership.user_id,
          new Set([membership.group_id]),
        );
      } else {
        const set = userOnlineGroups.get(membership.user_id);
        set.add(membership.group_id);
      }

      const inner = onlineGroupMembers.get(membership.group_id);
      inner.set(membership.user_id, socket);
    }

    return socket.send(JSON.stringify(respond));
  },

  // sending message to a spesific user
  private: async (socket, payload) => {
    const message = payload.message;
    const target = userSocketMap.get(payload.target);

    clientData = socketUserMap.get(socket);

    if (!target) {
      return socket.send(
        JSON.stringify({ status: "error", message: "No user exist" }),
      );
    }

    const payloadDb = {
      sender: clientData.id,
      content: message,
      reciever: payload.target,
    };

    const dbMessage = await dbHandler.dbMessage(payloadDb);

    const mail = {
      origin: clientData.id,
      message: message,
      messageId: dbMessage,
    };

    // respond to reciever
    const respond = respondHandler({
      event: "chat:recieved",
      status: "success",
      message: "you got mail",
      data: mail,
    });

    target.send(JSON.stringify(respond));

    // Respond to sender with success
    const senderRespond = respondHandler({
      event: "chat:sent",
      status: "success",
      message: "Message sent successfully",
      data: {
        message: message,
      },
    });
    socket.send(JSON.stringify(senderRespond));
  },

  // group logic
  group: async (socket, payload) => {
    const target = onlineGroupMembers.get(payload.targetGroup);

    // check if group exist
    if (!(await dbHandler.dbVerifyGroup(payload.targetGroup))) {
      return socket.send("No group exist");
    }

    clientData = socketUserMap.get(socket);
    const payloadDb = {
      sender: clientData.id,
      content: payload.message,
      reciever: payload.targetGroup,
    };

    const dbMessage = await dbHandler.dbMessageGroup(payloadDb);

    const messageFormat = {
      origin: clientData.id,
      message: payload.message,
      messageId: dbMessage,
    };

    const respond = respondHandler({
      event: "chat:recieved",
      status: "success",
      message: "recieved message",
      data: messageFormat,
    });

    const senderRespond = respondHandler({
      event: "chat:sent",
      status: "success",
      message: "Message sent successfully",
    });

    // sending to each member
    if (target) {
      for (const [key, value] of target) {
        const memberSocket = value;
        if (memberSocket !== socket) {
          return memberSocket.send(JSON.stringify(respond));
        } else {
          socket.send(JSON.stringify(senderRespond));
        }
      }
    }
  },

  // Send message to all user
  broadcast: (socket, payload) => {
    const message = payload.message;

    clientData = socketUserMap.get(socket);

    const mail = {
      origin: clientData.id,
      type: "broadcast",
      message: message,
    };

    // respond to reciever
    const respond = respondHandler({
      event: "chat:recieved",
      status: "success",
      message: "you got mail",
      data: mail,
    });

    socketUserMap.forEach((name, socket) => {
      socket.send(JSON.stringify(respond));
    });

    // Respond to sender with success
    const senderRespond = respondHandler({
      event: "chat:sent",
      status: "success",
      message: "Message sent successfully",
      data: {
        message: message,
      },
    });
    socket.send(JSON.stringify(senderRespond));
  },
};

export default handlers;
