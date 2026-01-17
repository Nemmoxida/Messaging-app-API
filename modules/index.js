import auth from "./auth/auth.js";
import signUp from "./auth/signUp.js";
import {
  createGroup,
  deleteGroup,
  changeGroupInfo,
} from "./groupLogic/groupLogic.js";

export default function index(express) {
  const router = express.Router();
  const accountRouter = express.Router();
  const groupRouter = express.Router();

  // account for login
  accountRouter.use("/auth", auth());
  accountRouter.post("/signup", signUp);

  // group for group logic
  groupRouter.post("/create", createGroup);
  groupRouter.delete("/delete", deleteGroup);
  groupRouter.put("/update", changeGroupInfo);

  router.use("/account", accountRouter);
  router.use("/group", groupRouter);

  return router;
}
