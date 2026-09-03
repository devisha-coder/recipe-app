const express = require("express");
const Recipe = require("../models/Recipe");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// CREATE recipe
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const recipe = await Recipe.create({
  ...req.body,
  image: req.file ? req.file.filename : "",
  createdBy: req.user.id,
});
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE recipe
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
   const updateData = {
  title: req.body.title,
  ingredients: req.body.ingredients,
  instructions: req.body.instructions,
  cookingTime: req.body.cookingTime,
};

if (req.file) {
  updateData.image = req.file.filename;
}

const recipe = await Recipe.findOneAndUpdate(
  {
    _id: req.params.id,
    createdBy: req.user.id,
  },
  updateData,
  {
    new: true,
  }
);

if (!recipe) {
  return res.status(404).json({
    message: "Recipe not found or you are not allowed to edit it",
  });
}

res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE recipe
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found or you are not allowed to delete it",
      });
    }

    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;