const express = require("express");
const router = express.Router();
const Notes = require("../models/Notes.js");
const fetchUser = require("../middleware/fetchUser.js");
const { body, validationResult } = require("express-validator");

// ROUTE 1: get ALL NOTES of a user: GET: "/api/notes/getallnotes" (login required)
router.get("/getallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: ADD a note: POST: "/api/notes/addnote" (login required)
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Title must be atleast 3 characters").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // ERROR, return BAD-REQUEST and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tag } = req.body;
    try {
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3: UPDATE an existing note: PUT: "/api/notes/updatenote" (login required)
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;

  // Create a newNote object
  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }
  try {
    // Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    // Allow update only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    // Update the note
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4: DELETE an existing note: DELETE: "/api/notes/deletenote" (login required)
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    // Find the note to be deleted and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    // Allow update only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    // Delete the note
    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
