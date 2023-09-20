const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepository postgres', () => {
  let newReply;

  beforeAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    newReply = {
      id: 'reply-0001',
      commentId: 'comment-0001',
      content: 'One step to start learning will go further in the long run :)',
      owner: 'user-123',
    };

    // prerequisite: user, thread and comment should be exist in database
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'wirasatrian', fullname: 'Wira Satria Negara' });
    await UsersTableTestHelper.addUser({ id: 'user-321', username: 'abhi', fullname: 'Abhi Satria' });
    await ThreadsTableTestHelper.createThread({
      id: 'thread-0001',
      title: 'Javascript',
      body: 'Learning Javascript is fun!',
      owner: 'user-123',
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-0001',
      threadId: 'thread-0001',
      content: 'is Javascript easy?',
      owner: 'user-321',
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist reply and return reply was created correctly', async () => {
      // Arrange
      await RepliesTableTestHelper.cleanTable();
      //   const reply = new AddReply(({ content, commentId, owner } = newReply));

      const fakeIdGenerator = () => '888';

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const replyRecord = await RepliesTableTestHelper.findReplyById(createdReply.id);
      expect(createdReply).toStrictEqual(
        new AddedReply({
          id: `reply-${fakeIdGenerator()}`,
          content: newReply.content,
          owner: newReply.owner,
        })
      );
      expect(replyRecord).toBeInstanceOf(Object);
    });
  });

  describe('verifyReplyAvailability function', () => {
    beforeEach(async () => {
      await RepliesTableTestHelper.cleanTable();
      await RepliesTableTestHelper.addReply(newReply);
    });

    it('should throw NotFoundError when comment or thread not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAvailability({
          threadId: 'thread-0003',
          commentId: 'comment-4567',
          replyId: newReply.id,
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply already deleted', async () => {
      // Arrange
      await RepliesTableTestHelper.deleteReplyById(newReply.id);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAvailability({
          threadId: 'thread-0001',
          commentId: newReply.commentId,
          replyId: newReply.id,
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAvailability({
          threadId: 'thread-0001',
          commentId: newReply.commentId,
          replyId: newReply.id,
        })
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when reply owner not match', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(({ id: replyId, owner } = newReply))).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when reply owner match', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      const owner = 'user-123';
      const replyId = 'reply-0001';
      await expect(replyRepositoryPostgres.verifyReplyOwner({ owner, replyId })).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getReplyById function', () => {
    beforeEach(async () => {
      await RepliesTableTestHelper.cleanTable();
      await RepliesTableTestHelper.addReply(newReply);
    });

    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.getReplyById('reply-4567')).rejects.toThrowError(NotFoundError);
    });

    it('should return reply correctly', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const reply = await replyRepositoryPostgres.getReplyById(newReply.id);

      // Assert
      expect(reply).toBeInstanceOf(Object);
      expect(reply.id).toStrictEqual(newReply.id);
    });
  });

  describe('deleteReplyById function', () => {
    beforeEach(async () => {
      await RepliesTableTestHelper.cleanTable();
      await RepliesTableTestHelper.addReply(newReply);
    });

    it('should throw NotFoundError when reply already deleted', async () => {
      // Arrange
      await RepliesTableTestHelper.deleteReplyById(newReply.id);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(
        replyRepositoryPostgres.verifyReplyAvailability({
          threadId: 'thread-0001',
          commentId: newReply.commentId,
          replyId: newReply.id,
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.deleteReplyById('comment-4567')).rejects.toThrowError(NotFoundError);
    });

    it('should delete reply and return deleted reply id', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const { id } = await replyRepositoryPostgres.deleteReplyById(newReply.id);
      const reply = await replyRepositoryPostgres.getReplyById(id);
      // Assert
      expect(reply.is_delete).toEqual(true);
      expect(id).toStrictEqual(newReply.id);
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return replies by comment id', async () => {
      // Arrange
      await RepliesTableTestHelper.cleanTable();
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

      await CommentsTableTestHelper.addComment({
        id: 'comment-0001',
        threadId: 'thread-0001',
        content: 'is Javascript easy?',
        owner: 'user-321',
      });

      const moreReply = {
        id: 'reply-0002',
        commentId: 'comment-0001',
        content: 'It is difficult for me. LOL',
        owner: 'user-222',
      };
      await RepliesTableTestHelper.addReply(newReply);
      await RepliesTableTestHelper.addReply(moreReply);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(newReply.commentId);

      // Assert
      expect(replies).toBeInstanceOf(Array);
      expect(replies).toHaveLength(2);
      expect(replies[0]).toBeInstanceOf(Object);
      expect(replies[0].id).toStrictEqual(newReply.id);
      expect(replies[0].username).toStrictEqual(user1.username);
      expect(replies[0].content).toStrictEqual(newReply.content);
      expect(replies[0].date).toBeDefined();
      expect(replies[0].isDeleted).toBe(false);
      expect(replies[1]).toBeInstanceOf(Object);
      expect(replies[1].id).toStrictEqual(moreReply.id);
      expect(replies[1].username).toStrictEqual(user3.username);
      expect(replies[1].content).toStrictEqual(moreReply.content);
      expect(replies[1].date).toBeDefined();
      expect(replies[1].isDeleted).toBe(false);
    });
  });
});
