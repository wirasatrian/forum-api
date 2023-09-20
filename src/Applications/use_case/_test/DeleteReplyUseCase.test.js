const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating delete reply action correctly', async () => {
    // Arrange
    const useCaseEndpointParameter = {
      threadId: 'thread-0001',
      commentId: 'comment-0001',
      replyId: 'reply-0001',
    };

    const userId = 'user-321';

    // creating dependency
    const mockReplyRepository = new ReplyRepository();

    // mocking
    mockReplyRepository.verifyReplyAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn().mockImplementation(() => Promise.resolve({ id: 'reply-0001' }));

    // creating use case instance
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCaseEndpointParameter, userId);

    // Assert
    expect(mockReplyRepository.verifyReplyAvailability).toBeCalledWith(useCaseEndpointParameter);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith({ owner: userId, replyId: useCaseEndpointParameter.replyId });
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(useCaseEndpointParameter.replyId);
  });
});
