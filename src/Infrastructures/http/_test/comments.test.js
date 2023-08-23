const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const HttpFunctionalTestHelper = require('../../../../tests/HttpFunctionalTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
// const { owner1, owner2, accessToken1, accessToken2, threadId } = require('./commentsTestSetup');

describe('/threads endpoints for comment features', () => {
  let server;
  let owner1;
  let owner2;
  let accessToken1;
  let accessToken2;
  let threadId;
  let response;

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

    response = await HttpFunctionalTestHelper.createUser({ server, payload: auth1Payload });
    owner1 = response.id;

    response = await HttpFunctionalTestHelper.userAuthentication({ server, payload: auth1Payload });
    accessToken1 = response.accessToken;

    response = await HttpFunctionalTestHelper.createUser({ server, payload: auth2Payload });
    owner2 = response.id;

    response = await HttpFunctionalTestHelper.userAuthentication({ server, payload: auth2Payload });
    accessToken2 = response.accessToken;
    //   console.log(`accessToken1: ${accessToken1}`);
    //   console.log(`accessToken2: ${accessToken2}`);
    //   console.log(`owner1: ${owner1}`);
    //   console.log(`owner2: ${owner2}`);

    const threadPayload = {
      title: 'Javascript',
      body: 'Belajar bahasa pemrograman Javascript',
    };

    response = await HttpFunctionalTestHelper.createThread({ server, accessToken: accessToken1, payload: threadPayload });
    threadId = JSON.parse(response.payload).data.addedThread.id;
  });

  beforeEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and new comment', async () => {
      //  console.log(`threadId: ${threadId}`);
      //  console.log(`accessToken2: ${accessToken2}`);

      // Arrange
      const commentPayload = {
        content: 'is Javascript easy ?',
      };

      const response1 = await HttpFunctionalTestHelper.addComment({ server, accessToken: accessToken2, threadId, payload: commentPayload });

      // Assert
      const responseJson = JSON.parse(response1.payload);
      expect(response1.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

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
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and return success status', async () => {
      // Arrange
      const commentPayload = {
        content: 'is Javascript easy ?',
      };

      const response = await HttpFunctionalTestHelper.addComment({ server, accessToken: accessToken2, threadId, payload: commentPayload });
      const { id: commentId } = JSON.parse(response.payload).data.addedComment;

      // Action
      const response2 = await HttpFunctionalTestHelper.deleteComment({ server, accessToken: accessToken2, threadId, commentId });

      // Assert
      const responseJson = JSON.parse(response2.payload);
      expect(response2.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when no access token in authorization header', async () => {
      // Arrange
      const commentPayload = {
        content: 'is Javascript easy ?',
      };

      const response = await HttpFunctionalTestHelper.addComment({ server, accessToken: accessToken2, threadId, payload: commentPayload });
      const { id: commentId } = JSON.parse(response.payload).data.addedComment;

      // Action
      const response2 = await HttpFunctionalTestHelper.deleteComment({ server, accessToken: ' ', threadId, commentId });

      // Assert
      const responseJson = JSON.parse(response2.payload);
      expect(response2.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when comment or thread not found', async () => {
      // Arrange
      const commentPayload = {
        content: 'is Javascript easy ?',
      };

      const response = await HttpFunctionalTestHelper.addComment({ server, accessToken: accessToken2, threadId, payload: commentPayload });
      const { id: commentId } = JSON.parse(response.payload).data.addedComment;

      // Action
      const response2 = await HttpFunctionalTestHelper.deleteComment({
        server,
        accessToken: accessToken2,
        threadId,
        commentId: commentId + 'xxx',
      });

      // Assert
      const responseJson = JSON.parse(response2.payload);
      expect(response2.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread atau comment tidak ditemukan');
    });

    it('should response 403 when comment owner not match', async () => {
      // Arrange
      const commentPayload = {
        content: 'is Javascript easy ?',
      };

      const response = await HttpFunctionalTestHelper.addComment({ server, accessToken: accessToken2, threadId, payload: commentPayload });
      const { id: commentId } = JSON.parse(response.payload).data.addedComment;

      // Action
      const response2 = await HttpFunctionalTestHelper.deleteComment({
        server,
        accessToken: accessToken1,
        threadId,
        commentId,
      });

      // Assert
      const responseJson = JSON.parse(response2.payload);
      expect(response2.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak berhak mengubah atau menghapus komentar ini');
    });
  });
});
