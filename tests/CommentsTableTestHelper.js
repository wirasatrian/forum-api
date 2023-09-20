/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({ id, threadId, content, owner, isDelete = false }) {
    const query = {
      text: 'INSERT INTO comments(id, thread_id, content, owner, is_delete) VALUES($1, $2, $3, $4, $5)',
      values: [id, threadId, content, owner, isDelete],
    };

    await pool.query(query);
  },

  async deleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
