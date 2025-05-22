const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 }) 
  response.json(blogs)
});

const jwt = require('jsonwebtoken')

blogsRouter.post('/', async (request, response) => {
  const { title, author, url, likes } = request.body

   const authorization = request.get('authorization')
  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const token = authorization.substring(7)
  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (error) {
    return response.status(401).json({ error: 'invalid token' })
  }

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  if (!title || !url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

   const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  
  const populatedBlog = await savedBlog.populate('user', { username: 1, name: 1 })

  response.status(201).json(populatedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const { likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes },
    { new: true, runValidators: true, context: 'query' }
  )

  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter;
