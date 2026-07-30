const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const Complaint = require("../models/Complaint");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

console.log("COMPLAINT ROUTES LOADED");

/* =========================================
   HELPER: DELETE UPLOADED FILE
========================================= */

const deleteUploadedFile = (file) => {
  if (!file?.filename) {
    return;
  }

  const uploadedFilePath = path.join(
    __dirname,
    "..",
    "uploads",
    file.filename
  );

  if (fs.existsSync(uploadedFilePath)) {
    fs.unlinkSync(uploadedFilePath);
  }
};

/* =========================================
   TEST ROUTE
========================================= */

router.get("/test", (req, res) => {
  res.send("Complaint Test Route Working");
});

/* =========================================
   CREATE COMPLAINT - LOGGED-IN USER
   OPTIONAL IMAGE UPLOAD
========================================= */

router.post(
  "/create",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        priority,
        problemLocality
      } = req.body;

      if (
        !title?.trim() ||
        !description?.trim() ||
        !category?.trim() ||
        !problemLocality?.trim()
      ) {
        deleteUploadedFile(req.file);

        return res.status(400).json({
          message:
            "Title, description, category, and problem locality are required"
        });
      }

      const allowedPriorities = ["Low", "Medium", "High"];

      const complaintPriority = allowedPriorities.includes(priority)
        ? priority
        : "Medium";

      const complaint = new Complaint({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority: complaintPriority,
        problemLocality: problemLocality.trim(),
        userId: req.user.id,
        image: req.file ? req.file.filename : ""
      });

      await complaint.save();

      return res.status(201).json({
        message: "Complaint created successfully",
        complaint
      });
    } catch (error) {
      console.error("CREATE COMPLAINT ERROR:", error);

      deleteUploadedFile(req.file);

      return res.status(500).json({
        message: error.message || "Server Error"
      });
    }
  }
);

/* =========================================
   GET MY COMPLAINTS - LOGGED-IN USER
========================================= */

router.get("/mycomplaints", authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({
      userId: req.user.id
    }).sort({
      createdAt: -1
    });

    return res.status(200).json(complaints);
  } catch (error) {
    console.error("GET MY COMPLAINTS ERROR:", error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
});

/* =========================================
   GET ALL COMPLAINTS - ADMIN ONLY
========================================= */

router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const complaints = await Complaint.find().sort({
        createdAt: -1
      });

      return res.status(200).json(complaints);
    } catch (error) {
      console.error("GET ALL COMPLAINTS ERROR:", error);

      return res.status(500).json({
        message: "Server Error"
      });
    }
  }
);

/* =========================================
   UPDATE COMPLAINT STATUS - ADMIN ONLY
========================================= */

router.put(
  "/update-status/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid complaint ID"
        });
      }

      const allowedStatuses = [
        "Pending",
        "In Progress",
        "Resolved"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid complaint status"
        });
      }

      const complaint = await Complaint.findByIdAndUpdate(
        id,
        {
          status
        },
        {
          new: true,
          runValidators: true
        }
      );

      if (!complaint) {
        return res.status(404).json({
          message: "Complaint not found"
        });
      }

      return res.status(200).json({
        message: "Complaint status updated successfully",
        complaint
      });
    } catch (error) {
      console.error("UPDATE COMPLAINT STATUS ERROR:", error);

      return res.status(500).json({
        message: "Server Error"
      });
    }
  }
);

/* =========================================
   DELETE COMPLAINT - ADMIN ONLY
   ALSO DELETE UPLOADED IMAGE
========================================= */

router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid complaint ID"
        });
      }

      const complaint = await Complaint.findById(id);

      if (!complaint) {
        return res.status(404).json({
          message: "Complaint not found"
        });
      }

      if (complaint.image) {
        const imagePath = path.join(
          __dirname,
          "..",
          "uploads",
          complaint.image
        );

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await Complaint.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Complaint deleted successfully"
      });
    } catch (error) {
      console.error("DELETE COMPLAINT ERROR:", error);

      return res.status(500).json({
        message: "Server Error"
      });
    }
  }
);

/* =========================================
   GET SINGLE COMPLAINT BY ID
   USER: ONLY THEIR OWN COMPLAINT
   ADMIN: ANY COMPLAINT
========================================= */

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid complaint ID"
      });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found"
      });
    }

    const isAdmin = req.user.role === "admin";

    const isOwner =
      complaint.userId.toString() === req.user.id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: "You are not authorized to view this complaint"
      });
    }

    return res.status(200).json(complaint);
  } catch (error) {
    console.error("GET SINGLE COMPLAINT ERROR:", error);

    return res.status(500).json({
      message: "Server Error"
    });
  }
});

module.exports = router;