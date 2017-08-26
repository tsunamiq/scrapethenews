// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  // title is a required string
  name: {
    type: String,
    required: true
  },
  // link is a required string
  note: {
    type: String,
    required: true
  }
});

// Create the Article model with the ArticleSchema
var Note = mongoose.model("Note", ArticleSchema);

// Export the model
module.exports = Note;
