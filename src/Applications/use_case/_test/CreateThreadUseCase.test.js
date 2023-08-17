const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const CreateThreadUseCase = require('../CreateThreadUseCase');

describe('CreateThreadUseCase', () => {
  it('should orchestrating the create thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Javascript',
      body: 'Belajar bahasa pemrograman Javascript',
    };

    const useCaseHeader = 'Bearer ThisIsAccessToken';

    const mockCreatedThread = new CreatedThread({
      id: 'thread-00001',
      title: useCasePayload.title,
      owner: 'user-123',
    });

    const accessToken = 'ThisIsAccessToken';

    // creating dependency
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // mocking
    mockAuthenticationTokenManager.getAccessTokenFromHeader = jest.fn().mockImplementation(() => Promise.resolve(accessToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn().mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ username: 'wirasatrian', id: 'user-123' }));
    mockThreadRepository.createThread = jest.fn().mockImplementation(() => Promise.resolve(mockCreatedThread));

    // Create the use case instace
    const createThreadUseCase = new CreateThreadUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const createdThread = await createThreadUseCase.execute(useCasePayload, useCaseHeader);

    // Assert
    expect(createdThread).toStrictEqual(mockCreatedThread);
    expect(mockAuthenticationTokenManager.getAccessTokenFromHeader).toBeCalledWith(useCaseHeader);
    expect(mockAuthenticationTokenManager.verifyAccessToken).toBeCalledWith(accessToken);
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(accessToken);
    expect(mockThreadRepository.createThread).toBeCalledWith(
      new CreateThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: mockCreatedThread.owner,
      })
    );
  });
});
