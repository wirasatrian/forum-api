const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepository postgres', () => {
  beforeAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    // prerequisite: user & thread should be exist in database
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'wirasatrian', fullname: 'Wira Satria Negara' });
    await UsersTableTestHelper.addUser({ id: 'user-321', username: 'abhi', fullname: 'Abhi Satria' });
    await ThreadsTableTestHelper.createThread({
      id: 'thread-0001',
      title: 'Javascript',
      body: 'Belajar bahasa pemrograman Javascript',
      owner: 'user-123',
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return comment was created correctly', async () => {
      // Arrange
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
      // expect(comments).toBeDefined();
    });
  });

  describe('verifyCommentAvailability function', () => {
    beforeAll(async () => {
      await CommentsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.addComment({
        id: 'comment-0001',
        threadId: 'thread-0001',
        content: 'is Javascript easy?',
        owner: 'user-321',
      });
    });

    it('should throw NotFoundError when comment or thread not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability({
          threadId: 'thread-0001',
          commentId: 'comment-4567',
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment already deleted', async () => {
      // Arrange
      await CommentsTableTestHelper.deleteCommentById('comment-0001');
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability({
          threadId: 'thread-0001',
          commentId: 'comment-0001',
        })
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    beforeAll(async () => {
      await CommentsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.addComment({
        id: 'comment-0001',
        threadId: 'thread-0001',
        content: 'is Javascript easy?',
        owner: 'user-321',
      });
    });

    it('should throw AuthorizationError when comment owner not match', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner({
          owner: 'user-123',
          commentId: 'comment-0001',
        })
      ).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    beforeAll(async () => {
      await CommentsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.addComment({
        id: 'comment-0001',
        threadId: 'thread-0001',
        content: 'is Javascript easy?',
        owner: 'user-321',
      });
    });
    it('should delete comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const delComment = await commentRepositoryPostgres.deleteCommentById('comment-0001');
      const comment = await CommentsTableTestHelper.findCommentById(delComment.id);
      // Assert
      expect(comment.is_delete).toEqual(true);
    });

        it('should throw NotFoundError when comment already deleted', async () => {
      // Arrange
      await CommentsTableTestHelper.deleteCommentById('comment-0001');
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteCommentById('comment-0001')).rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteCommentById('comment-4567')).rejects.toThrowError(NotFoundError);
    })

    it()
    
  });
});
