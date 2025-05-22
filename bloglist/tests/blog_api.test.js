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

test('adding a new blog increases the total blog count by 1', async () => {
  const beforeResponse = await api.get('/api/blogs')
  const beforeCount = beforeResponse.body.length

  const newBlog = {
    title: 'Test blog',
    author: 'Test Author',
    url: 'http://example.com/test-blog',
    likes: 10
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201) 
    .expect('Content-Type', /application\/json/)

  const afterResponse = await api.get('/api/blogs')
  const afterCount = afterResponse.body.length

  assert.strictEqual(afterCount, beforeCount + 1)

  const titles = afterResponse.body.map(blog => blog.title)
  assert.ok(titles.includes(newBlog.title))
})

test('if likes property is missing, it will default to 0', async () => {
  const newBlog = {
    title: 'Blog without likes',
    author: 'Author X',
    url: 'http://nolikes.com'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

after(async () => {
  await mongoose.connection.close()
})
