import { AppError } from "../../middlerware/customErrorObject.js";
import connection from "../../database/db.js";

const db = connection;

const memberQueryValidation = async (req, res, next) => {
  const userId = req.id;
  const { groupId, memberId } = req.body;

  if (!userId) {
    return next(new AppError("No userId detected", 400));
  }

  if (!groupId || !memberId) {
    return next(new AppError("No groupId and memberId detected", 400));
  }

  const role = await db.query(
    "SELECT role FROM group_member WHERE user_id = $1 AND group_id = $2 ",
    [userId, groupId],
  );

  if (!role.rows) {
    return next(new AppError("Data not found", 400));
  } else if (role.rows[0].role == "member") {
    return next(new AppError("Unauthorize role", 401));
  }

  next();
};

export default memberQueryValidation;
