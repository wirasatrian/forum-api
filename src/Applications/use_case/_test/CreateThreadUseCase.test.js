const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const CreateThreadUseCase = require('../CreateThreadUseCase');

describe('CreateThreadUseCase', () => {
  it('should orchestrating the create thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Javascript',
      body: 'Belajar bahasa pemrograman Javascript',
    };

    const userId = 'user-123';

    const mockCreatedThread = new CreatedThread({
      id: 'thread-00001',
      title: useCasePayload.title,
      owner: userId,
    });

    // creating dependency
    const mockThreadRepository = new ThreadRepository();

    // mocking
    mockThreadRepository.createThread = jest.fn(() =>
      Promise.resolve(
        new CreatedThread({
          id: 'thread-00001',
          title: useCasePayload.title,
          owner: userId,
        })
      )
    );

    // Create the use case instace
    const createThreadUseCase = new CreateThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdThread = await createThreadUseCase.execute(useCasePayload, userId);

    // Assert
    expect(createdThread).toStrictEqual(mockCreatedThread);
    expect(mockThreadRepository.createThread).toBeCalledWith(
      new CreateThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: mockCreatedThread.owner,
      })
    );
  });
});
