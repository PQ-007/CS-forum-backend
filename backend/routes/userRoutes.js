import express from "express";
import {
  loginUser,
  registerUser,
  deleteUser,
  logoutUser,
  updateUser,
  getUserProfile,
  getUsers,
  getUserDetails,
  updateUserById,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // Typo: "authMiddeware" -> "authMiddleware"

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/register", registerUser);

router.get("/", protect, admin, getUsers);

router.route("/profile").get(protect, getUserProfile).put(protect, updateUser);
router
  .route("/:id")
  .get(getUserDetails)
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUserById);
export default router;
