// routes/aptos.routes.js

import express from "express";
import aptosController from "../controller/aptos.controller.js";

const router = express.Router();


// Create new Aptos account (company or researcher)
router.post("/create-account", aptosController.createAccount);

// get userdetails
router.get("/user/:userId", aptosController.getUserById);

// Company → Platform transfer (simple APT transfer)
router.post("/transfer", aptosController.transferBetweenAccount);

// Check balance (for any account)
router.get("/balance/:address", aptosController.checkBalance);

// Platform → Researcher reward transaction (calls your Move module)
router.post("/reward", aptosController.transferReward);

export default router;
