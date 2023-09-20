const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating delete comment action correctly', async () => {
    // Arrange
    const useCaseEndpointParameter = {
      threadId: 'thread-0001',
      commentId: 'comment-0001',
    };

    const userId = 'user-321';

    // creating dependency
    const mockCommentRepository = new CommentRepository();

    // mocking

    mockCommentRepository.verifyCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn().mockImplementation(() => Promise.resolve({ id: 'user-321' }));

    // creating use case instance
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCaseEndpointParameter, userId);

    // Assert
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCaseEndpointParameter);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith({ owner: userId, commentId: useCaseEndpointParameter.commentId });
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(useCaseEndpointParameter.commentId);
  });
});
