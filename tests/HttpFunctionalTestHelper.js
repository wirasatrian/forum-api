const HttpFunctionalTestHelper = {
  async createUser({ server, payload }) {
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        ...payload,
      },
    });
    return JSON.parse(response.payload).data.addedUser;
  },

  async userAuthentication({ server, payload }) {
    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: payload.username,
        password: payload.password,
      },
    });
    return JSON.parse(response.payload).data;
  },

  async authentication({ server, payload }) {
    // add user and get id
    const userResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        ...payload,
      },
    });

    // Authenticate user and get access token
    const authResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: payload.username,
        password: payload.password,
      },
    });

    const { accessToken } = JSON.parse(authResponse.payload).data;
    return accessToken;
  },

  async createThread({ server, accessToken, payload }) {
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        ...payload,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response;
  },

  async addComment({ server, accessToken, threadId, payload }) {
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: {
        ...payload,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response;
  },

  async deleteComment({ server, accessToken, threadId, commentId }) {
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response;
  },
};

module.exports = HttpFunctionalTestHelper;
