// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const bookRoutes = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger); // custom request logger

// ─── Routes ───────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Online Bookstore API 📚', version: '1.0.0' });
});

app.use('/api/books', bookRoutes);

// ─── Error Handling ───────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Database + Server Start ──────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
