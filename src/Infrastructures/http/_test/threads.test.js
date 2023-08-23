const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const HttpFunctionalTestHelper = require('../../../../tests/HttpFunctionalTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads endpoints', () => {
  let server;
  let accessToken;

  beforeAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();

    server = await createServer(container);

    const authPayload = {
      username: 'wirasatrian',
      password: 'secret',
      fullname: 'Wira Satria Negara',
    };

    accessToken = await HttpFunctionalTestHelper.authentication({ server, payload: authPayload });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and new thread', async () => {
      // Arrange

      const threadPayload = {
        title: 'Javascript',
        body: 'Belajar bahasa pemrograman Javascript',
      };

      // Action
      const response = await HttpFunctionalTestHelper.createThread({ server, accessToken, payload: threadPayload });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

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
      const response = await HttpFunctionalTestHelper.createThread({ server, accessToken, payload: threadPayload });

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
      const response = await HttpFunctionalTestHelper.createThread({ server, accessToken, payload: threadPayload });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data properti tidak sesuai');
    });
  });
});
