const express = require("express");
const { signup, login, verifytoken, getuser, refreshToken, logout } = require("../controllers/user_controller");
const router = express.Router();


router.post("/signup",signup);
router.post("/login", login);
router.get("/user", verifytoken, getuser);
router.get("/refresh", refreshToken, verifytoken, getuser);
router.post("/logout", verifytoken, logout)
module.exports = router;