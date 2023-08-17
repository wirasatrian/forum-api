const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads endpoints', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and new thread', async () => {
      // Arrange
      const server = await createServer(container);

      // add user and get id
      const userResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'wirasatrian',
          password: 'secret',
          fullname: 'Wira Satria Negara',
        },
      });

      //   const { id } = (JSON.parse(userResponse.payload)).data.addUser;

      // Authenticate user and get access token
      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'wirasatrian',
          password: 'secret',
        },
      });

      const { accessToken } = JSON.parse(authResponse.payload).data;
      const requestPayload = {
        title: 'Javascript',
        body: 'Belajar bahasa pemrograman Javascript',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 401 when no access token in authorization header', async () => {
      // Arrange
      const server = await createServer(container);

      const requestPayload = {
        title: 'Javascript',
        body: 'Belajar bahasa pemrograman Javascript',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);

      // add user and get id
      const userResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'wirasatrian',
          password: 'secret',
          fullname: 'Wira Satria Negara',
        },
      });

      //   const { id } = (JSON.parse(userResponse.payload)).data.addUser;

      // Authenticate user and get access token
      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'wirasatrian',
          password: 'secret',
        },
      });

      const { accessToken } = JSON.parse(authResponse.payload).data;
      const requestPayload = {
        body: 'Just a body in a payload',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti tidak lengkap');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const server = await createServer(container);

      // add user and get id
      const userResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'wirasatrian',
          password: 'secret',
          fullname: 'Wira Satria Negara',
        },
      });

      //   const { id } = (JSON.parse(userResponse.payload)).data.addUser;

      // Authenticate user and get access token
      const authResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'wirasatrian',
          password: 'secret',
        },
      });

      const { accessToken } = JSON.parse(authResponse.payload).data;
      const requestPayload = {
        title: 12345,
        body: Boolean(12345),
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data properti tidak sesuai');
    });
  });
});
