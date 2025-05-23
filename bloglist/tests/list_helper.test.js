const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  const listWithMultipleBlogs = [
    {
      _id: '1',
      title: 'First blog',
      author: 'Author One',
      url: 'http://example.com/1',
      likes: 7,
      __v: 0
    },
    {
      _id: '2',
      title: 'Second blog',
      author: 'Author Two',
      url: 'http://example.com/2',
      likes: 5,
      __v: 0
    },
    {
      _id: '3',
      title: 'Third blog',
      author: 'Author Three',
      url: 'http://example.com/3',
      likes: 12,
      __v: 0
    }
  ]

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list has multiple blogs, sums all likes', () => {
    const result = listHelper.totalLikes(listWithMultipleBlogs)
    assert.strictEqual(result, 24)
  })

  test('when list is empty, equals 0', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })
})

describe('favorite blog', () => {
  const blogs = [
    {
      _id: '1',
      title: 'First blog',
      author: 'Author One',
      url: 'http://example.com/1',
      likes: 7,
      __v: 0
    },
    {
      _id: '2',
      title: 'Second blog',
      author: 'Author Two',
      url: 'http://example.com/2',
      likes: 5,
      __v: 0
    },
    {
      _id: '3',
      title: 'Third blog',
      author: 'Author Three',
      url: 'http://example.com/3',
      likes: 12,
      __v: 0
    }
  ]

  test('returns the blog with most likes', () => {
    const result = listHelper.favoriteBlog(blogs)

    assert.deepStrictEqual(result, {
      _id: '3',
      title: 'Third blog',
      author: 'Author Three',
      url: 'http://example.com/3',
      likes: 12,
      __v: 0
    })
  })

  test('returns null for empty list', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, null)
  })
})

describe('most blogs', () => {
  const blogs = [
    {
      _id: '1',
      title: 'Blog1',
      author: 'Robert C. Martin',
      url: 'url1',
      likes: 5,
      __v: 0
    },
    {
      _id: '2',
      title: 'Blog2',
      author: 'Robert C. Martin',
      url: 'url2',
      likes: 10,
      __v: 0
    },
    {
      _id: '3',
      title: 'Blog3',
      author: 'Robert C. Martin',
      url: 'url3',
      likes: 0,
      __v: 0
    },
    {
      _id: '4',
      title: 'Blog4',
      author: 'Edsger W. Dijkstra',
      url: 'url4',
      likes: 7,
      __v: 0
    },
    {
      _id: '5',
      title: 'Blog5',
      author: 'Edsger W. Dijkstra',
      url: 'url5',
      likes: 3,
      __v: 0
    }
  ]

  test('returns the author with the most blogs', () => {
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3
    })
  })

  test('returns null when list is empty', () => {
    const result = listHelper.mostBlogs([])
    assert.strictEqual(result, null)
  })
})

describe('most likes', () => {
  const blogs = [
    {
      _id: '1',
      title: 'Blog1',
      author: 'Author A',
      url: 'url1',
      likes: 7,
      __v: 0
    },
    {
      _id: '2',
      title: 'Blog2',
      author: 'Author B',
      url: 'url2',
      likes: 5,
      __v: 0
    },
    {
      _id: '3',
      title: 'Blog3',
      author: 'Author B',
      url: 'url3',
      likes: 12,
      __v: 0
    },
    {
      _id: '4',
      title: 'Blog4',
      author: 'Author C',
      url: 'url4',
      likes: 3,
      __v: 0
    }
  ]

  test('returns the author with the most likes', () => {
    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, {
      author: 'Author B',
      likes: 17
    })
  })

  test('returns null when list is empty', () => {
    const result = listHelper.mostLikes([])
    assert.strictEqual(result, null)
  })
})
