console.log("AUTH ROUTES LOADED");

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

/* =========================================
   TEST ROUTES
========================================= */

router.get("/test", (req, res) => {
  res.send("Auth Test Route Working");
});

router.get("/check", (req, res) => {
  console.log("CHECK ROUTE HIT");

  res.status(200).json({
    success: true,
    message: "Thunder Client Working"
  });
});

/* =========================================
   REGISTER ROUTE
========================================= */

router.post("/register", async (req, res) => {
  try {
    console.log("REGISTER ROUTE HIT");

    const {
      name,
      email,
      password,
      mobile,
      country,
      state,
      district,
      mandal,
      city,
      locality,
      address,
      pincode
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      !mobile?.trim() ||
      !country?.trim() ||
      !state?.trim() ||
      !district?.trim() ||
      !mandal?.trim() ||
      !city?.trim() ||
      !locality?.trim() ||
      !address?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        message: "Please complete all required registration fields"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      mobile: mobile.trim(),
      country: country.trim(),
      state: state.trim(),
      district: district.trim(),
      mandal: mandal.trim(),
      city: city.trim(),
      locality: locality.trim(),
      address: address.trim(),
      pincode: pincode.trim()
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully"
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "A user with this email already exists"
      });
    }

    res.status(500).json({
      message: "Server Error"
    });
  }
});

/* =========================================
   LOGIN ROUTE
========================================= */

router.post("/login", async (req, res) => {
  try {
    console.log("LOGIN ROUTE HIT");

    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      "secretkey123",
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        country: user.country,
        state: user.state,
        district: user.district,
        mandal: user.mandal,
        city: user.city,
        locality: user.locality,
        address: user.address,
        pincode: user.pincode
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

/* =========================================
   GET LOGGED-IN USER PROFILE
========================================= */

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User profile not found"
      });
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    res.status(500).json({
      message: "Unable to load profile"
    });
  }
});

/* =========================================
   UPDATE LOGGED-IN USER PROFILE
========================================= */

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      country,
      state,
      district,
      mandal,
      city,
      locality,
      address,
      pincode,
      currentPassword,
      newPassword
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User profile not found"
      });
    }

    if (
      !name?.trim() ||
      !email?.trim() ||
      !mobile?.trim() ||
      !country?.trim() ||
      !state?.trim() ||
      !district?.trim() ||
      !mandal?.trim() ||
      !city?.trim() ||
      !locality?.trim() ||
      !address?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        message: "Please complete all required profile fields"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailOwner = await User.findOne({
      email: normalizedEmail,
      _id: {
        $ne: user._id
      }
    });

    if (emailOwner) {
      return res.status(400).json({
        message: "This email address is already being used"
      });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message:
            "Enter your current password before choosing a new password"
        });
      }

      const currentPasswordMatches = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!currentPasswordMatches) {
        return res.status(400).json({
          message: "Current password is incorrect"
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            "New password must contain at least 6 characters"
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.mobile = mobile.trim();
    user.country = country.trim();
    user.state = state.trim();
    user.district = district.trim();
    user.mandal = mandal.trim();
    user.city = city.trim();
    user.locality = locality.trim();
    user.address = address.trim();
    user.pincode = pincode.trim();

    await user.save();

    const updatedToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      "secretkey123",
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: newPassword
        ? "Profile and password updated successfully"
        : "Profile updated successfully",

      token: updatedToken,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        country: user.country,
        state: user.state,
        district: user.district,
        mandal: user.mandal,
        city: user.city,
        locality: user.locality,
        address: user.address,
        pincode: user.pincode
      }
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "This email address is already being used"
      });
    }

    res.status(500).json({
      message: "Unable to update profile"
    });
  }
});

module.exports = router;