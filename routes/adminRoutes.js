const express = require("express");
const router = express.Router();
const passport = require("passport");

const adminController = require("../controllers/adminController");

// middleware для проверки аутентификации администратора
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.redirect("/login");
}

router.get("/profile", checkAuthenticated, adminController.getProfile);

module.exports = router;
