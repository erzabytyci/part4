const { test, before, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

let token = null

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
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('1234', 10)
  const user = new User({ username: 'ziza', passwordHash })
  await user.save()

  const loginRes = await api
    .post('/api/login')
    .send({ username: 'ziza', password: '1234' })

  token = loginRes.body.token

  const userFromDb = await User.findOne({ username: 'ziza' })

  const blogObjects = initialBlogs.map(blog => new Blog({ ...blog, user: userFromDb._id }))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  userFromDb.blogs = blogObjects.map(b => b._id)
  await userFromDb.save()
})

test('blogs are returned as json and correct length', async () => {
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`)

  assert.strictEqual(response.statusCode, 200)
  assert.strictEqual(response.headers['content-type'].includes('application/json'), true)
  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('blog without title is not added and returns 400', async () => {
  const newBlog = {
    author: 'Author NoTitle',
    url: 'http://notitle.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
})

test('blog without url is not added and returns 400', async () => {
  const newBlog = {
    title: 'No URL Blog',
    author: 'Author NoURL',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
})

test('unique identifier property is named id', async () => {
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`) 

  const blog = response.body[0]
  assert.ok(blog.id)
  assert.strictEqual(blog._id, undefined)
})

test('adding a new blog increases the total blog count by 1', async () => {
  const beforeResponse = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`) 
  const beforeCount = beforeResponse.body.length

  const newBlog = {
    title: 'Test blog',
    author: 'Test Author',
    url: 'http://example.com/test-blog',
    likes: 10
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const afterResponse = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`) 
  const afterCount = afterResponse.body.length

  assert.strictEqual(afterCount, beforeCount + 1)

  const titles = afterResponse.body.map(blog => blog.title)
  assert.ok(titles.includes(newBlog.title))
})

test('adding a blog fails with 401 if token not provided', async () => {
  const newBlog = {
    title: 'Unauthorized Blog',
    author: 'No Auth',
    url: 'http://fail.com',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

  const blogsAtEnd = await Blog.find({})
  const titles = blogsAtEnd.map(b => b.title)
  assert.ok(!titles.includes('Unauthorized Blog'))
})

test('if likes property is missing, it will default to 0', async () => {
  const newBlog = {
    title: 'Blog without likes',
    author: 'Author X',
    url: 'http://nolikes.com'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('a blog\'s likes can be updated', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToUpdate = blogsAtStart[0]

  const updatedLikes = blogToUpdate.likes + 10

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`) 
    .send({ likes: updatedLikes })

  assert.strictEqual(response.statusCode, 200)
  assert.strictEqual(response.body.likes, updatedLikes)

  const blogInDb = await Blog.findById(blogToUpdate.id)
  assert.strictEqual(blogInDb.likes, updatedLikes)
})

test('a blog can be deleted with valid token by creator', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await Blog.find({})
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

  const ids = blogsAtEnd.map(b => b.id)
  assert.ok(!ids.includes(blogToDelete.id))
})

after(async () => {
  await mongoose.connection.close()
})
