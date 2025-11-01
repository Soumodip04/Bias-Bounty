// controllers/aptos.controller.js
import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey, PrivateKey, U64 } from "@aptos-labs/ts-sdk";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import Reward from "../models/reward.model.js";

/* ----------------------------------------------------
  🧩 Configure Aptos Network (from env)
---------------------------------------------------- */
const networkName = (process.env.APTOS_NETWORK || "testnet").toLowerCase();
const networkMap = {
  mainnet: Network.MAINNET,
  testnet: Network.TESTNET,
  devnet: Network.DEVNET,
  local: Network.LOCAL,
};
const selectedNetwork = networkMap[networkName] || Network.TESTNET;
const config = new AptosConfig({ network: selectedNetwork });
const aptos = new Aptos(config);

/* ----------------------------------------------------
  ⚙️ Your deployed Move module details (from env)
---------------------------------------------------- */
const MODULE_ADDRESS = process.env.MODULE_ADDRESS;
if (!MODULE_ADDRESS) {
  throw new Error("MODULE_ADDRESS is required in environment variables");
}
const REWARD_FUNCTION = `${MODULE_ADDRESS}::biasbounty::reward_user`;

/* ----------------------------------------------------
  🪙 Platform wallet (required via env)
---------------------------------------------------- */
const SENDER_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY;
if (!SENDER_PRIVATE_KEY) {
  throw new Error("PLATFORM_PRIVATE_KEY is required in environment variables");
}

const formattedKey = PrivateKey.formatPrivateKey(SENDER_PRIVATE_KEY, "ed25519");
const senderPrivateKey = new Ed25519PrivateKey(formattedKey);
const senderAccount = Account.fromPrivateKey({ privateKey: senderPrivateKey });

console.log("✅ Platform (sender) account:", senderAccount.accountAddress.toString());

/* ----------------------------------------------------
  1️⃣ CREATE ACCOUNT + STORE IN DATABASE
---------------------------------------------------- */
const createAccount = async (req, res) => {
  try {
    const { userId, username, email, role } = req.body;

    // Basic validation
    if (!userId || !username || !email || !role) {
      return res.status(400).json({
        error: "userId, username, email, and role are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Generate new Aptos wallet
    const account = Account.generate();
    const walletAddress = account.accountAddress.toString();
    const privateKey = account.privateKey.toString();

    // Save user + wallet details to MongoDB
    const newUser = await User.create({
      userId,
      username,
      email,
      role,
      wallet_address: walletAddress,
      private_key: privateKey,
    });

    res.status(201).json({
      success: true,
      message: "User account created successfully",
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        wallet_address: newUser.wallet_address,
      },
    });
  } catch (err) {
    console.error("❌ Error creating account:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ----------------------------------------------------
  GET USER DETAILS BY USER ID
---------------------------------------------------- */
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Fetch user (private_key is hidden by default)
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User found",
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.role,
        wallet_address: user.wallet_address,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ----------------------------------------------------
  2️⃣ TRANSFER APT BETWEEN ACCOUNTS (COMPANY → PLATFORM)
---------------------------------------------------- */
const transferBetweenAccount = async (req, res) => {
  try {
    const { userId, receiverAddress, amount } = req.body;

    if (!userId || !receiverAddress || !amount) {
      return res.status(400).json({
        error: "userId, receiverAddress, and amount are required",
      });
    }

    // ✅ Fetch sender details from MongoDB
    const senderUser = await User.findOne({ userId }).select("+private_key"); // include private key
    if (!senderUser) {
      return res.status(404).json({ error: "Sender user not found" });
    }

    // Format sender's private key for Aptos SDK
    const formattedKey = PrivateKey.formatPrivateKey(senderUser.private_key, "ed25519");
    const privateKey = new Ed25519PrivateKey(formattedKey);
    const sender = Account.fromPrivateKey({ privateKey });

    // ✅ Double-check wallet address match (optional but good security)
    if (sender.accountAddress.toString() !== senderUser.wallet_address) {
      return res.status(400).json({
        error: "Stored private key does not match wallet address",
      });
    }

    // Build and send transfer transaction
    const txn = await aptos.transaction.build.simple({
      sender: sender.accountAddress,
      data: {
        function: "0x1::aptos_account::transfer",
        functionArguments: [receiverAddress, new U64(amount)],
      },
    });

    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: sender,
      transaction: txn,
    });

  const explorerNetwork = networkName;
  const explorerUrl = `https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=${explorerNetwork}`;

    // ✅ Save transaction in MongoDB
    await Transaction.create({
      userId,
      senderAddress: senderUser.wallet_address,
      receiverAddress,
      amount,
      hash: committedTxn.hash,
      explorerUrl,
      status: "SUCCESS",
    });

    res.json({
      success: true,
      message: "Transfer completed successfully",
      hash: committedTxn.hash,
      explorer: explorerUrl,
    });
  } catch (err) {
    console.error("❌ Transfer failed:", err);

    // Optionally store failed attempt
    if (req.body?.userId) {
      await Transaction.create({
        userId: req.body.userId,
        senderAddress: "UNKNOWN",
        receiverAddress: req.body.receiverAddress || "UNKNOWN",
        amount: req.body.amount || 0,
        hash: "N/A",
        status: "FAILED",
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ----------------------------------------------------
  3️⃣ CHECK BALANCE (no transaction required)
---------------------------------------------------- */
const checkBalance = async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await aptos.getAccountAPTAmount({ accountAddress: address });

    res.json({
      success: true,
      address,
      balance_octas: balance,
      balance_APT: balance / 1e8, // Convert Octas → APT
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ----------------------------------------------------
  TRANSFER REWARD (PLATFORM → RESEARCHER)
  Calls your deployed Move module's reward_user()
---------------------------------------------------- */
const transferReward = async (req, res) => {
  try {
    const { receiver, amount, reason } = req.body;

    if (!receiver || !amount) {
      return res
        .status(400)
        .json({ error: "receiver and amount are required" });
    }

    // ✅ Try to find the user by wallet address
    const receiverUser = await User.findOne({ wallet_address: receiver });

    // Build transaction to call your Move module reward_user()
    const txn = await aptos.transaction.build.simple({
      sender: senderAccount.accountAddress,
      data: {
        function: REWARD_FUNCTION,
        functionArguments: [receiver, new U64(amount)],
      },
    });

    const committedTxn = await aptos.signAndSubmitTransaction({
      signer: senderAccount,
      transaction: txn,
    });

  const explorerNetwork2 = networkName;
  const explorerUrl = `https://explorer.aptoslabs.com/txn/${committedTxn.hash}?network=${explorerNetwork2}`;

    // ✅ Store reward in MongoDB
    await Reward.create({
      userId: receiverUser ? receiverUser.userId : "UNKNOWN",
      receiverAddress: receiver,
      amount,
      hash: committedTxn.hash,
      explorerUrl,
      reason: reason || "Research reward",
      status: "SUCCESS",
    });

    res.json({
      success: true,
      message: "Reward transaction submitted",
      hash: committedTxn.hash,
      explorer: explorerUrl,
    });
  } catch (err) {
    console.error("❌ Reward transaction failed:", err);

    // Optional: record failed reward attempt
    await Reward.create({
      userId: "UNKNOWN",
      receiverAddress: req.body.receiver || "UNKNOWN",
      amount: req.body.amount || 0,
      hash: "N/A",
      reason: req.body.reason || "Reward failed",
      status: "FAILED",
    });

    res.status(500).json({ success: false, error: err.message });
  }
};



export default {
  getUserById,
  createAccount,
  transferBetweenAccount,
  checkBalance,
  transferReward,
};
