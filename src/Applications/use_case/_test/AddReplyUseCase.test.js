const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Small step to start learning will go further in the long run :)',
    };

    const useCaseHeader = 'Bearer ThisIsAccessToken';
    const useCaseEndpointParameter = {
      threadId: 'thread-0001',
      commentId: 'comment-0001',
    };

    const mockedAddedReply = new AddedReply({
      id: 'reply-0001',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    const accessToken = 'ThisIsAccessToken';

    // creating dependency
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // mocking
    mockAuthenticationTokenManager.getAccessTokenFromHeader = jest.fn().mockImplementation(() => Promise.resolve(accessToken));
    mockAuthenticationTokenManager.verifyAccessToken = jest.fn().mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ username: 'wirasatrian', id: mockedAddedReply.owner }));
    mockCommentRepository.verifyCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn().mockImplementation(() => Promise.resolve(mockedAddedReply));

    // creating use case instance
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCaseEndpointParameter, useCaseHeader, useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(mockedAddedReply);
    expect(mockAuthenticationTokenManager.getAccessTokenFromHeader).toBeCalledWith(useCaseHeader);
    expect(mockAuthenticationTokenManager.verifyAccessToken).toBeCalledWith(accessToken);
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(accessToken);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCaseEndpointParameter);
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new AddReply({
        content: useCasePayload.content,
        commentId: useCaseEndpointParameter.commentId,
        owner: mockedAddedReply.owner,
      })
    );
  });
});
