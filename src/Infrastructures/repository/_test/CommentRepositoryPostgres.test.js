const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepository postgres', () => {
  beforeAll(async () => {});

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return comment was created correctly', async () => {
      // Arrange

      // prerequisite: user & thread should be exist in database
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'wirasatrian', fullname: 'Wira Satria Negara' });
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'abhi', fullname: 'Abhi Satria' });
      await ThreadsTableTestHelper.createThread({
        id: 'thread-0001',
        title: 'Javascript',
        body: 'Belajar bahasa pemrograman Javascript',
        owner: 'user-123',
      });

      const comment = new AddComment({
        content: 'is Javascript easy?',
        threadId: 'thread-0001',
        owner: 'user-321',
      });

      const fakeIdGenerator = () => '222';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdComment = await commentRepositoryPostgres.addComment(comment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(createdComment.id);
      expect(createdComment).toStrictEqual(
        new AddedComment({
          id: `comment-${fakeIdGenerator()}`,
          content: comment.content,
          owner: comment.owner,
        })
      );
      expect(comments).toBeDefined();
    });
  });
});
