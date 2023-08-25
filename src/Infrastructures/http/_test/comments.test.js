const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const HttpFunctionalTestHelper = require('../../../../tests/HttpFunctionalTestHelper');
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

  beforeAll(async () => {
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
  });

  beforeEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 401 when no access token in authorization header', async () => {
      // Arrange
      const commentPayload = {
        content: 'is Javascript easy ?',
      };

      // Action
      const response = await HttpFunctionalTestHelper.addComment({ server, accessToken: '', threadId, payload: commentPayload });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const commentPayload = {
        title: 'is Javascript easy ?',
      };

      // Action
      const response = await HttpFunctionalTestHelper.addComment({ server, accessToken: accessToken2, threadId, payload: commentPayload });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru pada thread karena properti tidak lengkap');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const commentPayload = {
        content: 12345,
      };

      // Action
      const response = await HttpFunctionalTestHelper.addComment({ server, accessToken: accessToken2, threadId, payload: commentPayload });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru pada thread karena tipe data properti tidak sesuai');
    });

    it('should response 201 and new comment', async () => {
      // Arrange
      const commentPayload = {
        content: 'is Javascript easy ?',
      };

      const response = await HttpFunctionalTestHelper.addComment({ server, accessToken: accessToken2, threadId, payload: commentPayload });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeInstanceOf(Object);
      expect(responseJson.data.addedComment).toBeInstanceOf(Object);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    let commentId;

    beforeEach(async () => {
      // Arrange
      const commentPayload = {
        content: 'is Javascript easy ?',
      };

      const response = await HttpFunctionalTestHelper.addComment({ server, accessToken: accessToken2, threadId, payload: commentPayload });
      const { id } = JSON.parse(response.payload).data.addedComment;
      commentId = id;
    });
    it('should response 401 when no access token in authorization header', async () => {
      // Action
      const response = await HttpFunctionalTestHelper.deleteComment({ server, accessToken: ' ', threadId, commentId });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when comment or thread not found', async () => {
      // Action
      const response = await HttpFunctionalTestHelper.deleteComment({
        server,
        accessToken: accessToken2,
        threadId,
        commentId: commentId + 'xxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread atau comment tidak ditemukan');
    });

    it('should response 403 when comment owner not match', async () => {
      // Action
      const response = await HttpFunctionalTestHelper.deleteComment({
        server,
        accessToken: accessToken1,
        threadId,
        commentId,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengubah atau menghapus komentar ini');
    });

    it('should response 200 and return success status', async () => {
      // Action
      const response = await HttpFunctionalTestHelper.deleteComment({ server, accessToken: accessToken2, threadId, commentId });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
