// routes/admin.routes.js
import express from "express";
import adminController from "../controller/admin.controller.js";

const router = express.Router();

// Middleware to check if admin is logged in
const requireAuth = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.redirect("/admin/login");
};

// Login page
router.get("/login", adminController.showLoginPage);

// Login handler
router.post("/login", adminController.handleLogin);

// Dashboard (protected)
router.get("/", requireAuth, adminController.showDashboard);

// Transfer between accounts
router.post("/transfer", requireAuth, adminController.handleTransfer);

// Check balance
router.post("/check-balance", requireAuth, adminController.handleCheckBalance);

// Send reward
router.post("/reward", requireAuth, adminController.handleReward);

// Logout
router.post("/logout", adminController.handleLogout);

export default router;
