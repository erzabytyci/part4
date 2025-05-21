require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blogs');

const app = express();

const mongoUrl = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

mongoose.connect(mongoUrl);

app.use(express.json());
app.use('/api/blogs', blogsRouter);

module.exports = app;
