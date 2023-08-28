const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddCommentUseCase = require('../AddCommentUseCase');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating delete reply action correctly', async () => {
    // Arrange
    const useCaseHeader = 'Bearer ThisIsAccessToken';
    const useCaseEndpointParameter = {
      threadId: 'thread-0001',
      commentId: 'comment-0001',
      replyId: 'reply-0001',
    };

    const accessToken = 'ThisIsAccessToken';
    const ownerDecoded = 'user-321';

    // creating dependency
    const mockReplyRepository = new ReplyRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    // mocking
    mockAuthenticationTokenManager.getAccessTokenFromHeader = jest.fn().mockImplementation(() => Promise.resolve(accessToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn().mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ username: 'wirasatrian', id: ownerDecoded }));
    mockReplyRepository.verifyReplyAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn().mockImplementation(() => Promise.resolve());

    // creating use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await deleteReplyUseCase.execute(useCaseEndpointParameter, useCaseHeader);

    // Assert

    expect(mockAuthenticationTokenManager.getAccessTokenFromHeader).toBeCalledWith(useCaseHeader);
    expect(mockAuthenticationTokenManager.verifyAccessToken).toBeCalledWith(accessToken);
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(accessToken);
    expect(mockReplyRepository.verifyReplyAvailability).toBeCalledWith(useCaseEndpointParameter);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith({ owner: ownerDecoded, replyId: useCaseEndpointParameter.replyId });
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(useCaseEndpointParameter.replyId);
  });
});
