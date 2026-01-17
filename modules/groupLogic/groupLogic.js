import connection from "../../database/db.js";
import { clients } from "../websocket/handler/handlerMap.js";
import respondHanlder from "../controller/respondHandler.js";
import { AppError } from "../../middlerware/customErrorObject.js";
import { v4 as uuidv4 } from "uuid";

const db = connection;

export async function createGroup(req, res, next) {
  const { name, description } = req.body;
  if (!name) {
    return next(new AppError("Group must have a name", 400));
  }

  try {
    const id = uuidv4();

    const result = await db.query(
      "INSERT INTO groups(name, description, id) VALUES($1, $2, $3)",
      [name, description, id]
    );

    const respond = respondHanlder(
      { id: id, name: name },
      201,
      "Group successfully created"
    );
    return res.status(201).json(respond);
  } catch (error) {
    next(error);
  }
}

export function deleteGroup(req, res, next) {
  const { groupId } = req.body;

  // Check if groupId present in the payload
  if (!groupId) {
    return next(new AppError("No groupId detected", 400));
  }

  try {
    const result = db.query("DELETE FROM groups WHERE id = $1", [groupId]);
    const respond = respondHanlder(
      { groupId: groupId },
      200,
      "Group has been deleted"
    );
    return res.status(200).json(respond);
  } catch (error) {
    next(error);
  }
}

export function changeGroupInfo(req, res, next) {
  const { groupId, name, description } = req.body;

  // Check if groupId present in the payload
  if (!groupId) {
    return next(new AppError("No groupId detected", 400));
  } else if (!name || !description) {
    return next(new AppError("No name or description detected", 400));
  }

  try {
    const result = db.query(
      "UPDATE groups SET name = $1, description = $2 WHERE id = $3  ",
      [name, description, groupId]
    );
    const respond = respondHanlder(
      { groupId: groupId, name: name, description: description },
      200,
      "Group data has been updated"
    );

    return res.status(200).json(respond);
  } catch (error) {
    next(error);
  }
}
