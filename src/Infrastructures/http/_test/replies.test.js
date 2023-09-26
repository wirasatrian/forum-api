const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const HttpFunctionalTestHelper = require('../../../../tests/HttpFunctionalTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads endpoints for comment features', () => {
  let server;
  let owner1;
  let owner2;
  let accessToken1;
  let accessToken2;
  let threadId;
  let commentId;

  beforeAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    server = await createServer(container);

    const auth1Payload = {
      username: 'wirasatrian',
      password: 'secret',
      fullname: 'Wira Satria Negara',
    };

    const auth2Payload = {
      username: 'abhi',
      password: 'secret',
      fullname: 'Abhi Satria',
    };

    const auth1Response = await HttpFunctionalTestHelper.authentication({ server, payload: auth1Payload });
    owner1 = auth1Response.owner;
    accessToken1 = auth1Response.accessToken;

    const auth2Response = await HttpFunctionalTestHelper.authentication({ server, payload: auth2Payload });
    owner2 = auth2Response.owner;
    accessToken2 = auth2Response.accessToken;

    const threadPayload = {
      title: 'Javascript',
      body: 'Belajar bahasa pemrograman Javascript',
    };

    const response = await HttpFunctionalTestHelper.createThread({ server, accessToken: accessToken1, payload: threadPayload });
    threadId = JSON.parse(response.payload).data.addedThread.id;

    const commentPayload = {
      content: 'is Javascript easy ?',
    };

    const responseComment = await HttpFunctionalTestHelper.addComment({
      server,
      accessToken: accessToken2,
      threadId,
      payload: commentPayload,
    });
    commentId = JSON.parse(responseComment.payload).data.addedComment.id;
  });

  beforeEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and new comment', async () => {
      // Arrange
      const replyPayload = {
        content: 'One step to start learning will go further in the long run :)',
      };

      const response = await HttpFunctionalTestHelper.addReply({
        server,
        accessToken: accessToken1,
        threadId,
        commentId,
        payload: replyPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeInstanceOf(Object);
      expect(responseJson.data.addedReply).toBeInstanceOf(Object);
    });

    it('should response 401 when no access token in authorization header', async () => {
      // Arrange
      const replyPayload = {
        content: 'One step to start learning will go further in the long run :)',
      };

      // Action
      const response = await HttpFunctionalTestHelper.addReply({ server, accessToken: '', threadId, commentId, payload: replyPayload });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const replyPayload = {
        title: 'One step to start learning will go further in the long run :)',
      };

      // Action
      const response = await HttpFunctionalTestHelper.addReply({
        server,
        accessToken: accessToken1,
        threadId,
        commentId,
        payload: replyPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru pada comment karena properti tidak lengkap');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const replyPayload = {
        content: 556677,
      };

      // Action
      const response = await HttpFunctionalTestHelper.addReply({
        server,
        accessToken: accessToken1,
        threadId,
        commentId,
        payload: replyPayload,
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru pada comment karena tipe data properti tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    let replyId;

    beforeEach(async () => {
      // Arrange
      const replyPayload = {
        content: 'One step to start learning will go further in the long run :)',
      };

      const response = await HttpFunctionalTestHelper.addReply({
        server,
        accessToken: accessToken1,
        threadId,
        commentId,
        payload: replyPayload,
      });

      const { id } = JSON.parse(response.payload).data.addedReply;
      replyId = id;
    });

    it('should response 401 when no access token in authorization header', async () => {
      // Action
      const response = await HttpFunctionalTestHelper.deleteReply({ server, accessToken: ' ', threadId, commentId, replyId });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // Action
      const response = await HttpFunctionalTestHelper.deleteReply({
        server,
        accessToken: accessToken2,
        threadId: threadId + 'xxx',
        commentId,
        replyId,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread atau comment atau reply tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Action
      const response = await HttpFunctionalTestHelper.deleteReply({
        server,
        accessToken: accessToken2,
        threadId,
        commentId: commentId + 'xxx',
        replyId,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread atau comment atau reply tidak ditemukan');
    });

    it('should response 404 when reply not found', async () => {
      // Action
      const response = await HttpFunctionalTestHelper.deleteReply({
        server,
        accessToken: accessToken2,
        threadId,
        commentId,
        replyId: replyId + 'xxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread atau comment atau reply tidak ditemukan');
    });

    it('should response 403 when reply owner not match', async () => {
      // Action
      const response = await HttpFunctionalTestHelper.deleteReply({
        server,
        accessToken: accessToken2,
        threadId,
        commentId,
        replyId,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengubah atau menghapus balasan komentar ini');
    });

    it('should response 200 and return success status', async () => {
      // Action
      const response = await HttpFunctionalTestHelper.deleteReply({ server, accessToken: accessToken1, threadId, commentId, replyId });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
