require("dotenv").config(); // load .env

const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const User = require("./models/User");
const { isLoggedIn } = require("./middleware/auth");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/deadline_buddy")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// --- SESSION ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "deadlinebuddysecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGO_URI || "mongodb://127.0.0.1:27017/deadline_buddy",
    }),
  })
);

// --- MIDDLEWARE ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Make session user available in EJS templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// --- VIEW ENGINE ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- PAGE ROUTES (MUST COME FIRST) ---

app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

// LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login - Deadline Buddy",
    page: "login",
    message: null,
  });
});

app.get("/register", (req, res) => {
  res.render("register", {
    title: "Register - Deadline Buddy",
    page: "register",
    message: null,
  });
});

// REGISTER POST
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("register", {
      title: "Register - Deadline Buddy",
      page: "register",
      message: "All fields are required",
    });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.render("register", {
      title: "Register - Deadline Buddy",
      page: "register",
      message: "Email already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hashedPassword,
  });

  res.redirect("/login");
});

// LOGIN POST
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("login", {
      title: "Login - Deadline Buddy",
      page: "login",
      message: "All fields are required",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.render("login", {
      title: "Login - Deadline Buddy",
      page: "login",
      message: "User not found",
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.render("login", {
      title: "Login - Deadline Buddy",
      page: "login",
      message: "Incorrect password",
    });
  }

  req.session.user = {
    id: user._id,
    email: user.email,
  };

  res.redirect("/dashboard");
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// --- PROTECTED PAGES ---
app.get("/dashboard", isLoggedIn, (req, res) => {
  res.render("dashboard", {
    title: "Dashboard - Deadline Buddy",
    page: "dashboard",
    currentUser: req.session.user,
  });
});

app.get("/subjects", isLoggedIn, (req, res) => {
  res.render("subjects", {
    title: "Subjects - Deadline Buddy",
    page: "subjects",
  });
});

app.get("/notifications", isLoggedIn, (req, res) => {
  res.render("notifications", {
    title: "Notifications - Deadline Buddy",
    page: "notifications",
  });
});

app.get("/study-tips", isLoggedIn, (req, res) => {
  res.render("study-tips", {
    title: "Study Tips - Deadline Buddy",
    page: "study-tips",
  });
});

app.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", {
    title: "Profile - Deadline Buddy",
    page: "profile",
  });
});

// --- API ROUTES (MUST COME AFTER PAGE ROUTES) ---
app.use("/api/tasks", taskRoutes);
app.use("/api/user", userRoutes);

const notificationRoutes = require("./routes/notificationRoutes");

app.use("/api/notifications", notificationRoutes);

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
