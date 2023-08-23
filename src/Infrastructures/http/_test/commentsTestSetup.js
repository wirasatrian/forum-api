const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const HttpFunctionalTestHelper = require('../../../../tests/HttpFunctionalTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

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

  const server = await createServer(container);

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
  // threadId = id;
  // console.log(`url: /threads/${threadId}/comments`);
});

module.exports = { server, owner1, owner2, accessToken1, accessToken2, threadId };
