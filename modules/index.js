import auth from "./auth/auth.js";
import validation from "./auth/validation.js";
import signUp from "./auth/signUp.js";

export default function index(express) {
  const router = express.Router();

  router.use("/auth", auth());
  router.post("/signup", signUp);

  return router;
}
