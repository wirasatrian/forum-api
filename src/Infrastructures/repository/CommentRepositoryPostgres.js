const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(comment) {
    const { content, threadId, owner } = comment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, threadId, content, owner],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async verifyCommentAvailability({ threadId, commentId }) {
    const query = {
      text: 'SELECT * FROM comments AS c, threads AS t WHERE c.thread_id = t.id AND t.id = $1 AND c.id = $2 and NOT c.is_delete ',
      values: [threadId, commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('thread atau comment tidak ditemukan');
    }
  }

  async verifyCommentOwner({ owner, commentId }) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('Anda tidak berhak mengubah atau menghapus komentar ini');
    }
  }

  async getCommentById(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('thread atau comment tidak ditemukan');
    }
    return result.rows[0];
  }

  async deleteCommentById(commentId) {
    // await this.verifyCommentAvailability({ threadId, commentId });
    // const { owner } = await this.getCommentById(commentId);
    // await this.verifyCommentOwner({ owner, commentId });
    const { threadId, owner } = await this.getCommentById(commentId);
    const query = {
      text: 'UPDATE comments SET is_delete = NOT is_delete WHERE id = $1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('thread atau comment tidak ditemukan');
    }
  }
}

module.exports = CommentRepositoryPostgres;
