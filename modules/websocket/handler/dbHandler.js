import connection from "../../../database/db.js";
import { v7 as uuidv7 } from "uuid";

const db = connection;
const uuid = uuidv7();

const DbHandler = {
  dbMessage: async (payload) => {
    try {
      const save = await db.query(
        "INSERT INTO message(id, sender, content, reciever) VALUES($1, $2, $3, $4)",
        [uuid, payload.sender, payload.content, payload.reciever],
      );
      return uuid;
    } catch (error) {
      console.error(error.message);
      return new Error(error);
    }

    return uuid;
  },

  dbMessageGroup: async (payload) => {
    try {
      const save = await db.query(
        "INSERT INTO message_group(id, sender, content, reciever) VALUES($1, $2, $3, $4)",
        [uuid, payload.sender, payload.content, payload.reciever],
      );
      return uuid;
    } catch (error) {
      console.error(error.message);
      return new Error(error);
    }
  },

  dbVerifyGroup: async (group) => {
    try {
      const data = await db.query("SELECT * FROM groups where id = $1", [
        group,
      ]);

      return true;
    } catch (error) {
      return false;
    }
  },

  dbRefreshGroupMemberCache: async (group) => {
    try {
      const getData = await db.query(
        "SELECT user_id FROM group_member WHERE group_id = $1 ",
        [group],
      );
      return getData.rows;
    } catch (error) {
      console.error(error);
      return error;
    }
  },

  dbAddOnlineMemberGroup: async (userId) => {
    try {
      const getData = await db.query(
        "SELECT user_id,group_id FROM group_member WHERE user_id = $1 ",
        [userId],
      );
      return getData.rows;
    } catch (error) {
      console.error(error);
      return error;
    }
  },
};

export default DbHandler;
