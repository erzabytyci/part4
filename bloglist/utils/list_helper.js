const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((favorite, blog) => {
    return blog.likes > favorite.likes ? blog : favorite
  })
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const counts = _.countBy(blogs, 'author')
  const topAuthor = _.maxBy(Object.keys(counts), (author) => counts[author])

  return {
    author: topAuthor,
    blogs: counts[topAuthor]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const grouped = _.groupBy(blogs, 'author')

  const likesByAuthor = _.map(grouped, (authorBlogs, author) => {
    return {
      author,
      likes: _.sumBy(authorBlogs, 'likes')
    }
  })

  return _.maxBy(likesByAuthor, 'likes')
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
