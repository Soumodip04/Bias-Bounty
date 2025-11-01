// controller/admin.controller.js
import aptosController from "./aptos.controller.js";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

/* ----------------------------------------------------
  🧩 Configure Aptos Network (for balance checks only)
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
  ⚙️ Platform Configuration
---------------------------------------------------- */
const PLATFORM_ADDRESS = "0xd352cdfd4be4971ca3dc6a63298e69127e49d66b80d9e0e4fea2840d64bc2710";

/* ----------------------------------------------------
  Admin Credentials (hardcoded for demo)
---------------------------------------------------- */
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin@123";

/* ----------------------------------------------------
  Helper: Get Platform Balance
---------------------------------------------------- */
async function getPlatformBalance() {
  try {
    const balance = await aptos.getAccountAPTAmount({ accountAddress: PLATFORM_ADDRESS });
    return {
      success: true,
      address: PLATFORM_ADDRESS,
      balance_octas: balance,
      balance_APT: balance / 1e8,
    };
  } catch (err) {
    return null;
  }
}

/* ----------------------------------------------------
  Show Login Page
---------------------------------------------------- */
const showLoginPage = (req, res) => {
  res.render("admin-login", { error: null });
};

/* ----------------------------------------------------
  Handle Login
---------------------------------------------------- */
const handleLogin = (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect("/admin");
  } else {
    res.render("admin-login", { error: "Invalid username or password" });
  }
};

/* ----------------------------------------------------
  Show Dashboard
---------------------------------------------------- */
const showDashboard = async (req, res) => {
  const platformBalance = await getPlatformBalance();

  res.render("admin-dashboard", {
    platformBalance,
    platformAddress: PLATFORM_ADDRESS,
    transferResult: null,
    balanceResult: null,
    rewardResult: null,
  });
};

/* ----------------------------------------------------
  Handle Transfer Between Accounts
---------------------------------------------------- */
const handleTransfer = async (req, res) => {
  const platformBalance = await getPlatformBalance();
  
  try {
    // Create a mock response object to capture the result
    const mockRes = {
      statusCode: 200,
      data: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      }
    };

    // Call the aptos controller method
    await aptosController.transferBetweenAccount(req, mockRes);

    // Check if the transfer was successful
    if (mockRes.statusCode === 200 && mockRes.data.success) {
      res.render("admin-dashboard", {
        platformBalance,
        platformAddress: PLATFORM_ADDRESS,
        transferResult: {
          success: true,
          hash: mockRes.data.hash,
          explorer: mockRes.data.explorer,
        },
        balanceResult: null,
        rewardResult: null,
      });
    } else {
      res.render("admin-dashboard", {
        platformBalance,
        platformAddress: PLATFORM_ADDRESS,
        transferResult: { 
          success: false, 
          error: mockRes.data?.error || "Transfer failed" 
        },
        balanceResult: null,
        rewardResult: null,
      });
    }
  } catch (err) {
    console.error("Transfer error:", err);
    res.render("admin-dashboard", {
      platformBalance,
      platformAddress: PLATFORM_ADDRESS,
      transferResult: { success: false, error: err.message },
      balanceResult: null,
      rewardResult: null,
    });
  }
};

/* ----------------------------------------------------
  Handle Check Balance
---------------------------------------------------- */
const handleCheckBalance = async (req, res) => {
  const platformBalance = await getPlatformBalance();
  
  try {
    // Create a mock response object to capture the result
    const mockRes = {
      statusCode: 200,
      data: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      }
    };

    // Create a mock request with params instead of body
    const mockReq = { params: { address: req.body.address } };

    // Call the aptos controller method
    await aptosController.checkBalance(mockReq, mockRes);

    // Check if the balance check was successful
    if (mockRes.statusCode === 200 && mockRes.data.success) {
      res.render("admin-dashboard", {
        platformBalance,
        platformAddress: PLATFORM_ADDRESS,
        transferResult: null,
        balanceResult: {
          success: true,
          address: mockRes.data.address,
          balance_octas: mockRes.data.balance_octas,
          balance_APT: mockRes.data.balance_APT,
        },
        rewardResult: null,
      });
    } else {
      res.render("admin-dashboard", {
        platformBalance,
        platformAddress: PLATFORM_ADDRESS,
        transferResult: null,
        balanceResult: { 
          success: false, 
          error: mockRes.data?.error || "Balance check failed" 
        },
        rewardResult: null,
      });
    }
  } catch (err) {
    res.render("admin-dashboard", {
      platformBalance,
      platformAddress: PLATFORM_ADDRESS,
      transferResult: null,
      balanceResult: { success: false, error: err.message },
      rewardResult: null,
    });
  }
};

/* ----------------------------------------------------
  Handle Reward Transfer
---------------------------------------------------- */
const handleReward = async (req, res) => {
  const platformBalance = await getPlatformBalance();
  
  try {
    // Create a mock response object to capture the result
    const mockRes = {
      statusCode: 200,
      data: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      }
    };

    // Call the aptos controller method
    await aptosController.transferReward(req, mockRes);

    // Check if the reward was successful
    if (mockRes.statusCode === 200 && mockRes.data.success) {
      // Refresh platform balance
      const updatedBalance = await getPlatformBalance();

      res.render("admin-dashboard", {
        platformBalance: updatedBalance,
        platformAddress: PLATFORM_ADDRESS,
        transferResult: null,
        balanceResult: null,
        rewardResult: {
          success: true,
          hash: mockRes.data.hash,
          explorer: mockRes.data.explorer,
        },
      });
    } else {
      res.render("admin-dashboard", {
        platformBalance,
        platformAddress: PLATFORM_ADDRESS,
        transferResult: null,
        balanceResult: null,
        rewardResult: { 
          success: false, 
          error: mockRes.data?.error || "Reward transfer failed" 
        },
      });
    }
  } catch (err) {
    console.error("Reward error:", err);
    res.render("admin-dashboard", {
      platformBalance,
      platformAddress: PLATFORM_ADDRESS,
      transferResult: null,
      balanceResult: null,
      rewardResult: { success: false, error: err.message },
    });
  }
};

/* ----------------------------------------------------
  Handle Logout
---------------------------------------------------- */
const handleLogout = (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
};

export default {
  showLoginPage,
  handleLogin,
  showDashboard,
  handleTransfer,
  handleCheckBalance,
  handleReward,
  handleLogout,
};
