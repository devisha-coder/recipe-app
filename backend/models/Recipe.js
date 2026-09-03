const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    ingredients: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    cookingTime: {
      type: Number,
      required: true,
    },
    image: {
  type: String,
  default: "",
},
    createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);