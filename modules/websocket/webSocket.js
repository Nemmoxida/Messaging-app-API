import { WebSocketServer } from "ws";
import handlers from "./handler/handlerMap.js";
import { clients } from "./handler/handlerMap.js";
import jwt from "jsonwebtoken";
import { json } from "express";

export default function websocket(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket) => {
    socket.isAuthenticate = false;
    console.log("Connection established");
    socket.send("Connected");

    // set default client name
    clients.set(socket, { Id: "Null" });

    socket.on("message", (msg) => {
      let payload;

      // verify the payload before use
      try {
        payload = JSON.parse(msg);
      } catch (error) {
        socket.send(
          JSON.stringify({ type: "error", message: "Wrong JSON format" })
        );
      }

      if (socket.isAuthenticate == false) {
        if (payload.type == "auth" && payload.token) {
          try {
            const decode = jwt.verify(payload.token, process.env.SECRET_KEY);
            socket.isAuthenticate = true;
            return socket.send(
              JSON.stringify({
                type: "success",
                message: "Token validation completed",
              })
            );
          } catch (error) {
            socket.send(
              JSON.stringify({
                type: "Error",
                message: "Invalid Token",
              })
            );
          }
        } else {
          socket.send(
            JSON.stringify({
              type: "error",
              message: "Access forbidden. No token detected",
            })
          );
          socket.close();
        }
      }

      let clientData; // for searching the clientData

      const handler = handlers[payload.type];
      if (handler) {
        handler(socket, payload);
      } else {
        socket.send(
          JSON.stringify({ type: "error", message: "Invalid Method" })
        );
      }

      // private message to a spesific user
      if (payload.type === "private") {
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

        // console.log(clientData);
        const mail = {
          origin: clientData.Id,
          message: message,
        };

        target.send(JSON.stringify(mail));
      }

      if (payload.type === "broadcast") {
        const message = payload.message;

        clientData = clients.get(socket);

        const mail = {
          origin: clientData.Id,
          message: message,
        };

        clients.forEach((name, socket) => {
          socket.send(JSON.stringify(mail));
        });
      }
    });

    const pingClient = setInterval(() => {
      if (socket.readyState === 1) {
        socket.ping();
        console.log("client alive");
      } else {
        clearInterval(pingClient);
      }
    }, 30000);

    socket.on("close", () => {
      console.log("client disconected");
    });
  });
}
