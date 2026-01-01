import express from "express";
import index from "./modules/index.js";
import cookieParser from "cookie-parser";
import http from "http";
import websocket from "./modules/websocket/webSocket.js";
import database from "./database/db.js";
import errorHandler from "./middlerware/errorhandler.js";
import morgan from "morgan";
import "dotenv/config";

const app = express();
const server = http.createServer(app);
const port = 3000;

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

app.use("/", index(express));

websocket(server);

app.use(errorHandler);

server.listen(port, () => {
  console.log(`Server running at ${port}`);
});
