const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'is Javascript easy?',
    };

    const useCaseHeader = 'Bearer ThisIsAccessToken';
    const useCaseEndpointParameter = 'thread-0001';

    const mockedAddedComment = new AddedComment({
      id: 'comment-0001',
      content: useCasePayload.content,
      owner: 'user-321',
    });

    const accessToken = 'ThisIsAccessToken';

    // creating dependency
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // mocking
    mockAuthenticationTokenManager.getAccessTokenFromHeader = jest.fn().mockImplementation(() => Promise.resolve(accessToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn().mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ username: 'abhi', id: mockedAddedComment.owner }));
    mockThreadRepository.verifyAvailabilityThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(mockedAddedComment));

    // creating use case instance
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCaseEndpointParameter, useCaseHeader, useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(mockedAddedComment);
    expect(mockAuthenticationTokenManager.getAccessTokenFromHeader).toBeCalledWith(useCaseHeader);
    expect(mockAuthenticationTokenManager.verifyAccessToken).toBeCalledWith(accessToken);
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(accessToken);
    expect(mockThreadRepository.verifyAvailabilityThread).toBeCalledWith(useCaseEndpointParameter);
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new AddComment({
        content: useCasePayload.content,
        threadId: useCaseEndpointParameter,
        owner: mockedAddedComment.owner,
      })
    );
  });
});
