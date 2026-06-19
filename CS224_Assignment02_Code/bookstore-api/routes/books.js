// routes/books.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// ─────────────────────────────────────────────
// GET /api/books
// Get all books with optional search & pagination
// Query params: author, genre, page, limit
// ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { author, genre, page = 1, limit = 10 } = req.query;

    // Build dynamic filter object
    const filter = {};
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (genre)  filter.genre  = { $regex: genre,  $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Book.countDocuments(filter);
    const books = await Book.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: books,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// GET /api/books/:id
// Get a single book by ID
// ─────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      res.status(404);
      throw new Error(`Book not found with id: ${req.params.id}`);
    }

    res.status(200).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// POST /api/books
// Add a new book
// ─────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { title, author, genre, price, publishedDate, inStock } = req.body;

    // Manual required-field validation
    if (!title || !author || price === undefined) {
      res.status(400);
      throw new Error('title, author, and price are required fields');
    }

    const book = await Book.create({ title, author, genre, price, publishedDate, inStock });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: book,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// PUT /api/books/:id
// Update an existing book by ID
// ─────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const { title, author, price } = req.body;

    // Validate that at least required fields aren't being cleared
    if (title === '' || author === '' || price === '') {
      res.status(400);
      throw new Error('title, author, and price cannot be empty');
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      res.status(404);
      throw new Error(`Book not found with id: ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────
// DELETE /api/books/:id
// Delete a book by ID
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      res.status(404);
      throw new Error(`Book not found with id: ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: {},
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
