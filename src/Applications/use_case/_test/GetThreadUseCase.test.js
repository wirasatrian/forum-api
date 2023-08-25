const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrate to get thread detail correctly', async () => {
    //arrange
    const useCaseEndpointParameter = 'thread-0001';

    const mockDetailThread = new ThreadDetail({
      id: 'thread-0001',
      title: 'Javascript',
      body: 'Learning Javascript is fun!',
      date: '2021-08-08T07:19:09.775Z',
      username: 'Wira Satria Negara',
      comments: [],
    });

    const mockComments = [
      new CommentDetail({
        id: 'comment-0001',
        username: 'Abhi Satria',
        date: '2023-08-24T07:19:09.775Z',
        content: 'is Javascript easy ?',
        isDeleted: false,
      }),
      new CommentDetail({
        id: 'comment-0002',
        username: 'Wira Satria Negara',
        date: '2023-08-24T09:19:09.775Z',
        content: 'You should start learning ...and enjoy it :)',
        isDeleted: true,
      }),
    ];

    const mockChangedComments = [
      {
        id: 'comment-0001',
        username: 'Abhi Satria',
        date: '2023-08-24T07:19:09.775Z',
        content: 'is Javascript easy ?',
      },
      {
        id: 'comment-0002',
        username: 'Wira Satria Negara',
        date: '2023-08-24T09:19:09.775Z',
        content: '**komentar telah dihapus**',
      },
    ];

    // creating dependency
    const mockThreadRepository = new ThreadRepository();
    const mockCommenRepository = new CommentRepository();

    // mocking
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockDetailThread));
    mockCommenRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => Promise.resolve(mockComments));

    // Create the use case instace
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommenRepository,
    });

    getThreadUseCase._changeDeletedComment = jest.fn().mockImplementation((mockComments) => mockChangedComments);

    // Action
    const threadDetail = await getThreadUseCase.execute(useCaseEndpointParameter);

    // Assert
    expect(threadDetail).toStrictEqual(
      new ThreadDetail({
        ...mockDetailThread,
        comments: mockChangedComments,
      })
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseEndpointParameter);
    expect(mockCommenRepository.getCommentsByThreadId).toBeCalledWith(useCaseEndpointParameter);
    expect(getThreadUseCase._changeDeletedComment).toBeCalledWith(mockComments);
  });
});
