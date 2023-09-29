const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepository postgres', () => {
  let newUser;

  beforeAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    newUser = {
      id: 'user-123',
      username: 'wirasatrian',
      fullname: 'Wira Satria Negara',
    };

    // prerequisite: user should be exist in database
    await UsersTableTestHelper.addUser(newUser);
  });

  afterAll(async () => {
    // await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('createThread function', () => {
    it('should persist thread and return thread was created correctly', async () => {
      // Arrange

      const thread = new CreateThread({
        title: 'Javascript',
        body: 'Belajar bahasa pemrograman Javascript',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; //stub

      const expectedThread = {
        id: `thread-${fakeIdGenerator()}`,
        title: thread.title,
        body: thread.body,
        owner: thread.owner,
        created_at: expect.any(Date),
      };

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const createdThread = await threadRepositoryPostgres.createThread(thread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById(createdThread.id);
      expect(threads).toStrictEqual(expectedThread);
      expect(createdThread).toStrictEqual(
        new CreatedThread({
          id: expectedThread.id,
          title: expectedThread.title,
          owner: expectedThread.owner,
        })
      );
    });
  });

  describe('verifyAvailabilityThread function', () => {
    beforeAll(async () => {
      await ThreadsTableTestHelper.cleanTable();
      newThread = {
        id: 'thread-0001',
        title: 'Javascript',
        body: 'Learn Javascript is fun!',
        owner: 'user-123',
      };
      await ThreadsTableTestHelper.createThread(newThread);
    });

    it('should throw NotFoundError when thread does not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyAvailabilityThread('thread-8888')).rejects.toThrowError(NotFoundError);
    });
    it('should not throw NotFoundError when thread available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailabilityThread('thread-0001')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    let newThread;

    beforeAll(async () => {
      await ThreadsTableTestHelper.cleanTable();
      newThread = {
        id: 'thread-0001',
        title: 'Javascript',
        body: 'Learn Javascript is fun!',
        owner: 'user-123',
      };
      await ThreadsTableTestHelper.createThread(newThread);
    });

    it('should throw error when thread does not exist', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-8888')).rejects.toThrowError(NotFoundError);
    });

    it('should persist thread and return detail thread correctly', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-0001');

      // Assert
      expect(thread.id).toStrictEqual(newThread.id);
      expect(thread.title).toStrictEqual(newThread.title);
      expect(thread.body).toStrictEqual(newThread.body);
      expect(thread.date).toBeDefined();
      expect(thread.username).toStrictEqual(newUser.username);
    });
  });
});
