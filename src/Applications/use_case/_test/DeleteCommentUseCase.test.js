const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddCommentUseCase = require('../AddCommentUseCase');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating delete comment action correctly', async () => {
    // Arrange
    const useCaseHeader = 'Bearer ThisIsAccessToken';
    const useCaseEndpointParameter = {
      threadId: 'thread-0001',
      commentId: 'comment-0001',
    };

    const accessToken = 'ThisIsAccessToken';
    const ownerDecoded = 'user-321';

    // creating dependency
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // mocking
    mockAuthenticationTokenManager.getAccessTokenFromHeader = jest.fn().mockImplementation(() => Promise.resolve(accessToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn().mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ username: 'abhi', id: ownerDecoded }));
    mockCommentRepository.verifyCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn().mockImplementation(() => Promise.resolve());

    // creating use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await deleteCommentUseCase.execute(useCaseEndpointParameter, useCaseHeader);

    // Assert

    expect(mockAuthenticationTokenManager.getAccessTokenFromHeader).toBeCalledWith(useCaseHeader);
    expect(mockAuthenticationTokenManager.verifyAccessToken).toBeCalledWith(accessToken);
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(accessToken);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCaseEndpointParameter);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith({ owner: ownerDecoded, commentId: useCaseEndpointParameter.commentId });
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(useCaseEndpointParameter.commentId);
  });
});
