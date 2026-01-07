import connection from "../../../database/db.js";
import dbHandler from "./dbHandler.js";
import respondHandler from "./respondHandlerWS.js"; // respond format

export const clients = new Map();

let clientData; // for searching the clientData
const respondPayloadFormat = {};

const handlers = {
  // Setting clients name or ID (basically login)
  setName: async (socket, payload) => {
    const db = connection;
    const validation = await db.query(
      "SELECT username FROM accounts WHERE username = $1",
      [payload]
    );
    if (!validation.rows) {
      return socket.send("Invalid username");
    }
    clients.set(socket, { Id: payload });
    const respond = respondHandler({
      event: "auth:login",
      status: "success",
      message: `Your name is now set to ${payload}`,
    });

    return socket.send(JSON.stringify(respond));
  },

  // sending message to a spesific user
  private: async (socket, payload) => {
    console.log("trigger");
    const message = payload.message;
    const target = [...clients.entries()].find(([socket, name]) => {
      return name.Id == payload.target;
    })?.[0];

    clientData = clients.get(socket);

    if (!target) {
      return socket.send(
        JSON.stringify({ status: "error", message: "No user exist" })
      );
    }

    const payloadDb = {
      sender: clientData.Id,
      content: message,
      reciever: payload.target,
    };

    const dbMessage = await dbHandler(payloadDb);

    const mail = {
      origin: clientData.Id,
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

  // Send message to all user
  broadcast: (socket, payload) => {
    const message = payload.message;

    clientData = clients.get(socket);

    const mail = {
      origin: clientData.Id,
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

    clients.forEach((name, socket) => {
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
