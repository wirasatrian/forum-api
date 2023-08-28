const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(reply) {
    const { content, commentId, owner } = reply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies(id, comment_id, content, owner) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, commentId, content, owner],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReplyAvailability({ threadId, commentId, replyId }) {
    const query = {
      text: `SELECT 1 
              FROM replies AS r
              JOIN comments AS c ON r.comment_id = c.id
              JOIN threads AS t ON c.thread_id = t.id
              WHERE t.id = $1 AND c.id = $2 and r.id = $3 and NOT r.is_delete`,
      values: [threadId, commentId, replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('thread atau comment tidak ditemukan');
    }
  }

  async verifyReplyOwner({ owner, replyId }) {
    const query = {
      text: 'SELECT TRUE AS is_Exist FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('Anda tidak berhak mengubah atau menghapus balasan komentar ini');
    }
  }

  async getReplyById(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('reply tidak ditemukan');
    }
    return result.rows[0];
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = NOT is_delete WHERE id = $1 RETURNING id',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('reply tidak ditemukan');
    }
    return result.rows[0];
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT r.id, r.content,
                  TO_CHAR(r.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS date,
                  u.username, r.is_delete
                  FROM replies AS r
    				      JOIN users AS u
                  ON r.owner = u.id
    				      WHERE r.comment_id = $1
                  ORDER BY r.created_at`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    const mapResult = result.rows.map((row) => new ReplyDetail({ ...row, isDeleted: row.is_delete }));
    return mapResult;
  }
}

module.exports = ReplyRepositoryPostgres;
