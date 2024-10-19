const express = require("express");
const User = require("../models/User.js");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const fetchUser = require("../middleware/fetchUser.js");

const JWT_SECRET = "ILoveSwscho";
//TO-DO: JWT_SECRET should be a long random string and stored in a .env file

// ROUTE 1: CREATE a USER using: POST: "/api/auth/createuser" (No login required)
router.post(
  "/createuser", // EXPRESS-VALIDATION
  [
    body("name", "Name must be atleast 3 characters").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // ERROR, return BAD-REQUEST and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success = false;
      return res.status(400).json({ success, errors: errors.array() });
    }

    // user with this "email" ALREADY EXISTS
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        success = false;
        return res.status(400).json({
          success,
          error: "Sorry a user with this email already exists",
        });
      }

      // PASSWORD-HASHING
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // CREATE a new USER
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      // JWT-AUTHENTICATION
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 2: AUTHENTICATE a USER using: POST: "/api/auth/login" (No login required)
router.post(
  "/login", // EXPRESS-VALIDATION
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    // ERROR, return BAD-REQUEST and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success = false;
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with correct credentials",
        });
      }

      // JWT-PAYLOAD
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: get a LOGGED-IN USER using: POST: "/api/auth/getuser" (login required)
router.post("/getuser", fetchUser, async (req, res) => {
  try {
    let userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    success = true;
    res.send({ success, user });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
