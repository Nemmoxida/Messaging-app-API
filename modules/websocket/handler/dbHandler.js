import connection from "../../../database/db.js";
import { v7 as uuidv7 } from "uuid";

export default async function dbHandler(payload) {
  const db = connection;
  const uuid = uuidv7();

  try {
    const save = await db.query(
      "INSERT INTO message(id, sender, content, reciever) VALUES($1, $2, $3, $4)",
      [uuid, payload.sender, payload.content, payload.reciever]
    );
  } catch (error) {
    console.error(error.message);
  }

  return uuid;
}
