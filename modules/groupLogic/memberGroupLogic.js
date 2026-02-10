import connection from "../../database/db.js";
import { AppError } from "../../middlerware/customErrorObject.js";
import { userSocket } from "../websocket/handler/handlerMap.js";
import respondHanlder from "../controller/respondHandler.js";

const db = connection;

export async function addMember(req, res, next) {
  const userId = req.id;
  const { groupId, memberId } = req.body;

  try {
    const addMemberDb = await db.query(
      "INSERT INTO group_member(role,group_id,user_id) VALUES($1,$2,$3)",
      ["member", groupId, memberId],
    );
    const respond = respondHanlder(null, 201, "User added successfully");

    return res.status(201).json(respond);
  } catch (error) {
    if (error.code === "22P02") {
      // Foreign key violation: memberId does not exist in referenced table
      return next(new AppError("User (memberId) does not exist", 400));
    }
    return next(error);
  }
}

export async function kickMember(req, res, next) {
  const { groupId, memberId } = req.body;

  try {
    const kickMemberDb = await db.query(
      "DELETE FROM group_member WHERE group_id = $1 AND user_id = $2",
      [groupId, memberId],
    );
    const respond = respondHanlder(null, 200, "User kicked successfully");

    return res.status(201).json(respond);
  } catch (error) {
    if (error.code === "22P02") {
      // Foreign key violation: memberId does not exist in referenced table
      return next(new AppError("User (memberId) does not exist", 400));
    }
    return next(error);
  }
}

export async function changeRoleMember(req, res, next) {
  const { groupId, memberId, role } = req.body;
  const userId = req.id;

  if (userId == "admin" && role == "owner") {
    return next(new AppError("Unauthorize role", 401));
  }

  try {
    const kickMemberDb = await db.query(
      "UPDATE group_member SET role = $1 WHERE group_id = $2 AND user_id = $3",
      [role, groupId, memberId],
    );
    const respond = respondHanlder(null, 200, "User role has been modified");

    return res.status(200).json(respond);
  } catch (error) {
    if (error.code === "22P02") {
      // Foreign key violation: memberId does not exist in referenced table
      return next(new AppError("User (memberId) does not exist", 400));
    }
    return next(error);
  }
}
