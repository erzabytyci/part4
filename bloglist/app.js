const express = require('express');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blogs');

const app = express();

const mongoUrl = 'mongodb+srv://fullstack:pw@cluster0.yy2qlyw.mongodb.net/bloglist?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoUrl);

app.use(express.json());
app.use('/api/blogs', blogsRouter);

module.exports = app;
