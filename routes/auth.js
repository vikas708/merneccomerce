const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Received login request for username:", username);

    const user = await User.findOne({ username });
    console.log("Found user in the database:", user);

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const decryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    ).toString(CryptoJS.enc.Utf8);

    console.log("Decrypted password:", decryptedPassword);
    console.log("Input password:", password);

    if (decryptedPassword !== password) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password: _, ...others } = user._doc;
    console.log("User successfully logged in:", username);
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "An error occurred during login." });
  }
});


// LOGOUT
router.post("/logout", (req, res) => {
  try {
    const token = req.header("Authorization");

    // Check if the token is provided in the request headers
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify and decode the token to get user information
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token" });
      }

      // Assuming you have a deleteToken function defined on req.user
      req.user.deleteToken(token, (deleteError, deletedUser) => {
        if (deleteError) {
          console.log("Route /logout is registered")
          return res.status(400).send(deleteError);
        }

        // If the token deletion is successful, respond with a success message.
        res.status(200).json({ message: "Logout successful" });
      });
    });
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).json({ error: "An error occurred during logout." });
  }
});


module.exports = router;