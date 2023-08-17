const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const pool = require('../../database/postgres/pool');

describe('ThreadRepository postgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('createThread function', () => {
    it('should persist thread and return thread was created correctly', async () => {
      // Arrange

      // prerequisite: user should be exist in database
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'wirasatrian', fullname: 'Wira Satria Negara' });

      const aThread = new CreateThread({
        title: 'Javascript',
        body: 'Belajar bahasa pemrograman Javascript',
      });

      const fakeOwnerGenerator = () => 'user-123';
      const fakeIdGenerator = () => '123'; //stub

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator, fakeOwnerGenerator);

      // Action
      const createdThread = await threadRepositoryPostgres.createThread(aThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById(createdThread.id);
      expect(createdThread).toStrictEqual(
        new CreatedThread({
          id: threads.id,
          title: threads.title,
          owner: threads.owner,
        })
      );
      //   expect(threads).toHaveLength(1);
    });
  });
});
