const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
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

      const expectedResult = {
        id: `comment-${fakeIdGenerator()}`,
        content: newComment.content,
        owner: newComment.owner,
        thread_id: newComment.threadId,
        is_delete: false,
        created_at: expect.any(Date),
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdComment = await commentRepositoryPostgres.addComment(comment);

      // Assert
      const result = await CommentsTableTestHelper.findCommentById(createdComment.id);

      expect(result).toStrictEqual(expectedResult);
      expect(createdComment).toStrictEqual(
        new AddedComment({
          id: expectedResult.id,
          content: expectedResult.content,
          owner: expectedResult.owner,
        })
      );
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

    it('should not throw NotFoundError when comment and thread available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability({
          threadId: newComment.threadId,
          commentId: newComment.id,
        })
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    beforeEach(async () => {
      await CommentsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.addComment(newComment);
    });

    it('should throw AuthorizationError when comment owner not match', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      const owner = 'user-3212';
      const commentId = 'comment-0001';
      await expect(commentRepositoryPostgres.verifyCommentOwner({ owner, commentId })).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when comment owner match', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      const owner = 'user-321';
      const commentId = 'comment-0001';
      await expect(commentRepositoryPostgres.verifyCommentOwner({ owner, commentId })).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getCommentById function', () => {
    beforeEach(async () => {
      await CommentsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.addComment(newComment);
    });

    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentById('comment-4567')).rejects.toThrowError(NotFoundError);
    });

    it('should return comment correctly when comment found ', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const expectedComment = {
        id: newComment.id,
        content: newComment.content,
        owner: newComment.owner,
        thread_id: newComment.threadId,
        is_delete: false,
        created_at: expect.any(Date),
      };

      // Action
      const comment = await commentRepositoryPostgres.getCommentById(newComment.id);

      // Assert
      expect(comment).toStrictEqual(expectedComment);
      expect(comment.created_at).toBeInstanceOf(Date);
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

    it('should delete comment and return deleted comment id', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const { id } = await commentRepositoryPostgres.deleteCommentById(newComment.id);
      const comment = await commentRepositoryPostgres.getCommentById(id);
      // Assert
      expect(comment.is_delete).toEqual(true);
      expect(id).toStrictEqual(newComment.id);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments on Thread', async () => {
      // Arrange
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();

      const user1 = { id: 'user-123', username: 'wirasatrian', fullname: 'Wira Satria Negara' };
      const user2 = { id: 'user-321', username: 'abhi', fullname: 'Abhi Satria' };
      const user3 = { id: 'user-222', username: 'budi', fullname: 'Budi Utomo' };
      await UsersTableTestHelper.addUser(user1);
      await UsersTableTestHelper.addUser(user2);
      await UsersTableTestHelper.addUser(user3);

      await ThreadsTableTestHelper.createThread({
        id: 'thread-0001',
        title: 'Javascript',
        body: 'Learning Javascript is fun!',
        owner: 'user-123',
      });

      const moreComment = {
        id: 'comment-0002',
        threadId: 'thread-0001',
        content: 'is it the same with java ?',
        owner: 'user-222',
      };

      await CommentsTableTestHelper.addComment(newComment);
      await CommentsTableTestHelper.addComment(moreComment);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(newComment.threadId);

      // Assert
      expect(comments).toBeInstanceOf(Array);
      expect(comments).toHaveLength(2);
      expect(comments[0]).toBeInstanceOf(Object);
      expect(comments[0].id).toStrictEqual(newComment.id);
      expect(comments[0].username).toStrictEqual(user2.username);
      expect(comments[0].date).toBeDefined();
      expect(comments[0].content).toStrictEqual(newComment.content);
      expect(comments[0].isDeleted).toBe(false);
      expect(comments[0].replies).toBeInstanceOf(Array);
      expect(comments[0].replies).toHaveLength(0);
      expect(comments[1]).toBeInstanceOf(Object);
      expect(comments[1].id).toStrictEqual(moreComment.id);
      expect(comments[1].username).toStrictEqual(user3.username);
      expect(comments[1].date).toBeDefined();
      expect(comments[1].content).toStrictEqual(moreComment.content);
      expect(comments[1].isDeleted).toBe(false);
      expect(comments[1].replies).toBeInstanceOf(Array);
      expect(comments[1].replies).toHaveLength(0);
    });
  });
});
