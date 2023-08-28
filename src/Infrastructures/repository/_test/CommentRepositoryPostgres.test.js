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
  let newComment;

  beforeAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    newComment = {
      id: 'comment-0001',
      threadId: 'thread-0001',
      content: 'is Javascript easy?',
      owner: 'user-321',
    };

    // prerequisite: user & thread should be exist in database
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'wirasatrian', fullname: 'Wira Satria Negara' });
    await UsersTableTestHelper.addUser({ id: 'user-321', username: 'abhi', fullname: 'Abhi Satria' });
    await ThreadsTableTestHelper.createThread({
      id: 'thread-0001',
      title: 'Javascript',
      body: 'Learning Javascript is fun!',
      owner: 'user-123',
    });
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist comment and return comment was created correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.cleanTable();
      const comment = new AddComment(({ content, threadId, owner } = newComment));

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
    beforeEach(async () => {
      await CommentsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.addComment(newComment);
    });

    it('should throw NotFoundError when comment or thread not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability({
          threadId: newComment.threadId,
          commentId: 'comment-4567',
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment already deleted', async () => {
      // Arrange
      await CommentsTableTestHelper.deleteCommentById(newComment.id);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability({
          threadId: newComment.threadId,
          commentId: newComment.id,
        })
      ).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when comment owner not match', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner(({ id: commentId, owner } = newComment))).rejects.toThrowError(
        AuthorizationError
      );
    });
  });

  describe('deleteCommentById function', () => {
    beforeEach(async () => {
      await CommentsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.addComment(newComment);
    });

    it('should throw NotFoundError when comment already deleted', async () => {
      // Arrange
      await CommentsTableTestHelper.deleteCommentById(newComment.id);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability({
          threadId: newComment.threadId,
          commentId: newComment.id,
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteCommentById('comment-4567')).rejects.toThrowError(NotFoundError);
    });

    it('should delete comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const delComment = await commentRepositoryPostgres.deleteCommentById(newComment.id);
      const comment = await commentRepositoryPostgres.getCommentById(delComment.id);
      // Assert
      expect(comment.is_delete).toEqual(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments on Thread', async () => {
      // Arrange
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'wirasatrian', fullname: 'Wira Satria Negara' });
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'abhi', fullname: 'Abhi Satria' });
      await UsersTableTestHelper.addUser({ id: 'user-222', username: 'budi', fullname: 'Budi Utomo' });
      await ThreadsTableTestHelper.createThread({
        id: 'thread-0001',
        title: 'Javascript',
        body: 'Learning Javascript is fun!',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment(newComment);
      await CommentsTableTestHelper.addComment({
        id: 'comment-0002',
        threadId: 'thread-0001',
        content: 'is it the same with java ?',
        owner: 'user-222',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(newComment.threadId);

      // Assert
      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(2);
    });
  });
});
