import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View engine setup for EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware for admin authentication
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: false // Set to true if using HTTPS
    },
  })
);

// Static files (optional for future use)
app.use(express.static(path.join(__dirname, "public")));

// CORS configuration (strict: only allow http://localhost:3000 for API routes)
const ALLOWED_ORIGIN = "http://localhost:3000";

const corsOptions = {
  origin(origin, callback) {
    // Strict: require origin to match exactly
    if (origin === ALLOWED_ORIGIN) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS only to API routes, not admin routes
app.use("/api", cors(corsOptions));

// Defer importing modules that depend on env until after dotenv is configured
const { default: connectDB } = await import("./config/db.js");
const { default: aptosRoutes } = await import("./routes/aptos.routes.js");
const { default: adminRoutes } = await import("./routes/admin.routes.js");

connectDB();

// Mount routes
app.use("/api/aptos", aptosRoutes);
app.use("/admin", adminRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Aptos backend running! Visit <a href='/admin'>/admin</a> for admin panel.");
});

const PORT = parseInt(process.env.PORT || "4000", 10);
app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
  console.log(`🛡️  Admin panel: http://localhost:${PORT}/admin`);
});
