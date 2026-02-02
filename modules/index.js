import auth from "./auth/auth.js";
import signUp from "./auth/signUp.js";
import validation from "./auth/validation.js";
import {
  createGroup,
  deleteGroup,
  changeGroupInfo,
} from "./groupLogic/groupLogic.js";
import {
  addMember,
  kickMember,
  changeRoleMember,
} from "./groupLogic/memberGroupLogic.js";
import memberQueryValidation from "./groupLogic/memberGroupValidation.js";

export default function index(express) {
  const router = express.Router();
  const accountRouter = express.Router();
  const groupRouter = express.Router();
  const groupMember = express.Router();

  // account for login
  accountRouter.use("/auth", auth());
  accountRouter.post("/signup", signUp);

  // group for group logic
  groupRouter.post("/create", validation(), createGroup);
  groupRouter.delete("/delete", deleteGroup);
  groupRouter.put("/update", changeGroupInfo);

  // groupMember for members logic
  groupMember.post("/add", validation(), memberQueryValidation, addMember);
  groupMember.delete("/kick", validation(), memberQueryValidation, kickMember);
  groupMember.put(
    "/changeRole",
    validation(),
    memberQueryValidation,
    changeRoleMember,
  );

  router.use("/account", accountRouter);
  router.use("/group", groupRouter);
  router.use("/groupMember", groupMember);

  return router;
}
