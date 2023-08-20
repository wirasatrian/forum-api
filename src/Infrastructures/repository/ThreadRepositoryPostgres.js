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

  //   async getThreadById(id) {
  //     const query = {
  //       text: 'SELECT a.*, b.username FROM threads a, users b WHERE a.owner = b.id AND a.id = $1',
  //       values: [id],
  //     };

  //     const result = await this._pool.query(query);
  //     if (!result.rows.length) {
  //       throw new NotFoundError('thread tidak ditemukan');
  //     }
  //     return result.rows[0];
  //   }
}

module.exports = ThreadRepositoryPostgres;
