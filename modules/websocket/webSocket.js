import { WebSocketServer } from "ws";
import handlers from "./handler/handlerMap.js";
import { clients } from "./handler/handlerMap.js";
import jwt from "jsonwebtoken";
import respondHandler from "./handler/respondHandlerWS.js";

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
            handlers.setName(socket, decode.username);
            const respond = respondHandler({
              event: "auth:login",
              status: "success",
              message: `Auth complete`,
            });
            socket.send(JSON.stringify(respond));
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

      // handling the WS request type
      if (socket.isAuthenticate == true) {
        const handler = handlers[payload.type];
        if (handler) {
          handler(socket, payload);
        } else {
          socket.send(
            JSON.stringify({ type: "error", message: "Invalid Method" })
          );
        }
      }

      // check connection to client
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
  });
}
