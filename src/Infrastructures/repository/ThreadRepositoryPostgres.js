const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const CreatedThread = require('../../Domains/threads/entities/CreatedThread');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async createThread(thread) {
    const { title, body, owner } = thread;
    const id = `thread-${this._idGenerator()}`;
    // const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);
    return new CreatedThread({ ...result.rows[0] });
  }

  async verifyAvailabilityThread(threadId) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async getThreadById(threadId) {
    const query = {
      text: `SELECT t.id, t.title, t.body, u.username, 
              TO_CHAR(t.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS date 
              FROM threads AS t 
              JOIN users AS u 
              ON t.owner = u.id 
              WHERE t.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('thread tidak ditemukan');
    }
    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
