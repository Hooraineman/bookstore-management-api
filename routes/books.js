const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// GET /api/books -> all books, with optional search + pagination
router.get('/', async (req, res, next) => {
  try {
    const { author, genre, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (genre) filter.genre = { $regex: genre, $options: 'i' };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const books = await Book.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Book.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: books
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id -> single book
router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
});

// POST /api/books -> create new book
router.post('/', async (req, res, next) => {
  try {
    const { title, author, price } = req.body;

    if (!title || !author || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'title, author, and price are required fields'
      });
    }

    const newBook = await Book.create(req.body);
    res.status(201).json({ success: true, data: newBook });
  } catch (err) {
    next(err);
  }
});

// PUT /api/books/:id -> update book
router.put('/:id', async (req, res, next) => {
  try {
    const { title, author, price } = req.body;

    if (!title || !author || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'title, author, and price are required fields'
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({ success: true, data: updatedBook });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/books/:id -> delete book
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;