const { test, before, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'First Blog',
    author: 'Author One',
    url: 'http://example.com/1',
    likes: 3
  },
  {
    title: 'Second Blog',
    author: 'Author Two',
    url: 'http://example.com/2',
    likes: 5
  }
]

before(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
})

test('blogs are returned as json and correct length', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.statusCode, 200)
  assert.strictEqual(response.headers['content-type'].includes('application/json'), true)
  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('unique identifier property is named id', async () => {
  const response = await api.get('/api/blogs')

  const blog = response.body[0]
  assert.ok(blog.id)
  assert.strictEqual(blog._id, undefined) 
})


after(async () => {
  await mongoose.connection.close()
})
