const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const HttpFunctionalTestHelper = require('../../../../tests/HttpFunctionalTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads endpoints', () => {
  let server;
  let accessToken1;
  let accessToken2;

  beforeAll(async () => {
    // await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
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

    const { accessToken: accessTokenUser2 } = await HttpFunctionalTestHelper.authentication({ server, payload: auth2Payload });
    accessToken2 = accessTokenUser2;
    const { accessToken: accessTokenUser1 } = await HttpFunctionalTestHelper.authentication({ server, payload: auth1Payload });
    accessToken1 = accessTokenUser1;
  });

  afterAll(async () => {
    // await RepliesTableTestHelper.cleanTable();
    // await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  beforeEach(async () => {
    // await RepliesTableTestHelper.cleanTable();
    // await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 401 when no access token in authorization header', async () => {
      // Arrange
      const threadPayload = {
        title: 'Javascript',
        body: 'Belajar bahasa pemrograman Javascript',
      };

      // Action
      const response = await HttpFunctionalTestHelper.createThread({ server, accessToken: '', payload: threadPayload });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const threadPayload = {
        body: 'Just a body in a payload',
      };

      // Action
      const response = await HttpFunctionalTestHelper.createThread({ server, accessToken: accessToken1, payload: threadPayload });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti tidak lengkap');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const threadPayload = {
        title: 12345,
        body: {},
      };

      // Action
      const response = await HttpFunctionalTestHelper.createThread({ server, accessToken: accessToken1, payload: threadPayload });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data properti tidak sesuai');
    });

    it('should response 201 and new thread', async () => {
      // Arrange

      const threadPayload = {
        title: 'Javascript',
        body: 'Belajar bahasa pemrograman Javascript',
      };

      // Action
      const response = await HttpFunctionalTestHelper.createThread({ server, accessToken: accessToken1, payload: threadPayload });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    // Arrange
    let threadId;

    beforeEach(async () => {
      const threadPayload = {
        title: 'Javascript',
        body: 'Belajar bahasa pemrograman Javascript',
      };

      const response = await HttpFunctionalTestHelper.createThread({ server, accessToken: accessToken1, payload: threadPayload });
      threadId = JSON.parse(response.payload).data.addedThread.id;
    });

    it('should response 404 when thread does not exist', async () => {
      // Action
      const response = await HttpFunctionalTestHelper.getThreadById({ server, threadId: 'thread-xxxx' });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 200 and thread detail', async () => {
      // Arrange
      const user2Comment = {
        content: 'is Javascript easy ?',
      };

      const reply1User2Comment = {
        content: 'One step to start learning will go further in the long run :)',
      };

      const reply2User2Comment = {
        content: 'It seem difficult for me to understand..LOL',
      };

      const user1Comment = {
        content: 'You should learn Javascript ..have fun!',
      };

      // const reply1User1Comment = {
      //   content: 'On the way ...',
      // };

      // const reply2User1Comment = {
      //   content: `Let's go !`,
      // };

      const responseComment1 = await HttpFunctionalTestHelper.addComment({
        server,
        accessToken: accessToken2,
        threadId,
        payload: user2Comment,
      });
      const commentId = JSON.parse(responseComment1.payload).data.addedComment.id;
      await HttpFunctionalTestHelper.addComment({ server, accessToken: accessToken1, threadId, payload: user1Comment });

      await HttpFunctionalTestHelper.addReply({ server, accessToken: accessToken1, threadId, commentId, payload: reply1User2Comment });
      await HttpFunctionalTestHelper.addReply({ server, accessToken: accessToken2, threadId, commentId, payload: reply2User2Comment });

      // Action
      const response = await HttpFunctionalTestHelper.getThreadById({ server, threadId });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeInstanceOf(Object);
      expect(responseJson.data.thread).toBeInstanceOf(Object);
      expect(responseJson.data.thread.comments).toBeInstanceOf(Array);
      expect(responseJson.data.thread.comments).toHaveLength(2);
    });
  });
});
