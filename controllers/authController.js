const User = require("../models/User");
const bcrypt = require("bcryptjs");

// LOGIN PAGE
exports.getLogin = (req, res) => {
  res.render("login", { 
    page: "login",
    currentUser: req.session.user,
    message: ""
  });
};

// REGISTER PAGE
exports.getRegister = (req, res) => {
  res.render("register", { 
    page: "register",
    currentUser: req.session.user,
    message: ""
  });
};

// REGISTER POST
exports.postRegister = async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.render("register", {
      page: "register",
      currentUser: null,
      message: "Email is already registered"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    email,
    password: hashedPassword
  });

  res.redirect("/login");
};

// LOGIN POST
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.render("login", {
      page: "login",
      currentUser: null,
      message: "Invalid email or password"
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.render("login", {
      page: "login",
      currentUser: null,
      message: "Incorrect password"
    });
  }

  req.session.user = {
    id: user._id,
    email: user.email
  };

  res.redirect("/dashboard");
};

// LOGOUT
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
