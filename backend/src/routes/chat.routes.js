import expresss from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";

const router = expresss.Router();

router.get("/token", protectRoute, getStreamToken)

export default router; 




//stream to authenticate the users