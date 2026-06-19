const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  genre: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  publishedDate: {
    type: Date
  },
  inStock: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Book', bookSchema);