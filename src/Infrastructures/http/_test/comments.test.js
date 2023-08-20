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

    accessToken1 = await HttpFunctionalTestHelper.authentication({ server, payload: auth1Payload });
    accessToken2 = await HttpFunctionalTestHelper.authentication({ server, payload: auth2Payload });
    // console.log(`accessToken1: ${accessToken1}`);
    // console.log(`accessToken2: ${accessToken2}`);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    beforeAll(async () => {
      const threadPayload = {
        title: 'Javascript',
        body: 'Belajar bahasa pemrograman Javascript',
      };

      const response = await HttpFunctionalTestHelper.createThread({ server, accessToken: accessToken1, payload: threadPayload });

      const { id } = JSON.parse(response.payload).data.addedThread;
      threadId = id;
    });

    it('should response 201 and new comment', async () => {
      // Arrange

      const commentPayload = {
        content: 'is Javascript easy ?',
      };

      // Action
      const response = await HttpFunctionalTestHelper.addComment({ server, accessToken: accessToken2, threadId, payload: commentPayload });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
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
});
