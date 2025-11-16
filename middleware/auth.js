// Authentication middleware
function isLoggedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// For API routes, return JSON instead of redirect
function isLoggedInAPI(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  next();
}

module.exports = { isLoggedIn, isLoggedInAPI };
