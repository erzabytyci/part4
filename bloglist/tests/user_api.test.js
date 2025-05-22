const { test, before, after, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

before(async () => {
  await User.deleteMany({})
})

describe('when creating users', () => {
  test('creation fails with short password', async () => {
    const result = await api
      .post('/api/users')
      .send({ username: 'shorty', name: 'Shorty', password: 'pw' })
      .expect(400)

    assert.match(result.body.error, /at least 3/)
  })

  test('creation fails with short username', async () => {
    const result = await api
      .post('/api/users')
      .send({ username: 'ab', name: 'Tiny', password: 'strongpass' })
      .expect(400)

    assert.match(result.body.error, /at least 3/)
  })

  test('creation fails if username already exists', async () => {
    const user = {
      username: 'uniqueuser',
      name: 'Someone',
      password: 'strongpass',
    }

    await api.post('/api/users').send(user).expect(201)

    const result = await api.post('/api/users').send(user).expect(400)
    assert.match(result.body.error, /unique/)
  })

  test('creation fails if password is missing', async () => {
    const result = await api
      .post('/api/users')
      .send({ username: 'user1', name: 'NoPass' })
      .expect(400)

    assert.match(result.body.error, /Password must/)
  })
})

after(async () => {
  await mongoose.connection.close()
})
