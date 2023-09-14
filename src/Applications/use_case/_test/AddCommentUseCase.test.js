const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
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

    const userId = 'user-321';
    const useCaseEndpointParameter = 'thread-0001';

    const mockedAddedComment = new AddedComment({
      id: 'comment-0001',
      content: useCasePayload.content,
      owner: userId,
    });

    // creating dependency
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    // mocking
    mockThreadRepository.verifyAvailabilityThread = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn(() =>
      Promise.resolve(
        new AddedComment({
          id: 'comment-0001',
          content: useCasePayload.content,
          owner: userId,
        })
      )
    );

    // creating use case instance
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCaseEndpointParameter, userId, useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(mockedAddedComment);
    expect(mockThreadRepository.verifyAvailabilityThread).toBeCalledWith(useCaseEndpointParameter);
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new AddComment({
        content: useCasePayload.content,
        threadId: useCaseEndpointParameter,
        owner: userId,
      })
    );
  });
});
