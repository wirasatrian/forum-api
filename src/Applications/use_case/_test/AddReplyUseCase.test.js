const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Small step to start learning will go further in the long run :)',
    };

    const userId = 'user-123';

    const useCaseEndpointParameter = {
      threadId: 'thread-0001',
      commentId: 'comment-0001',
    };

    const mockedAddedReply = new AddedReply({
      id: 'reply-0001',
      content: useCasePayload.content,
      owner: userId,
    });

    // creating dependency
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // mocking
    mockCommentRepository.verifyCommentAvailability = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn(() =>
      Promise.resolve(
        new AddedReply({
          id: 'reply-0001',
          content: useCasePayload.content,
          owner: userId,
        })
      )
    );

    // creating use case instance
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCaseEndpointParameter, userId, useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(mockedAddedReply);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(useCaseEndpointParameter);
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new AddReply({
        content: useCasePayload.content,
        commentId: useCaseEndpointParameter.commentId,
        owner: userId,
      })
    );
  });
});
