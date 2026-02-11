import connection from "../../database/db.js";
import { AppError } from "../../middlerware/customErrorObject.js";
import respondHanlder from "../controller/respondHandler.js";
import notifyUserWs from "./notifyUserWs.js";

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

    notifyUserWs(memberId, groupId, "added", "You have been added to group: ");

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
    notifyUserWs(
      memberId,
      groupId,
      "kicked",
      "You have been kicked from group: ",
    );

    return res.status(200).json(respond);
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

    notifyUserWs(
      memberId,
      groupId,
      "Role change",
      `Your role has been change to ${role}`,
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
