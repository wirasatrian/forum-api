const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
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
      username: 'wirasatrian',
      comments: [],
    });

    const mockComments = [
      new CommentDetail({
        id: 'comment-0001',
        username: 'abhi',
        date: '2023-08-24T07:19:09.775Z',
        content: 'is Javascript easy ?',
        replies: [],
        isDeleted: false,
      }),
      new CommentDetail({
        id: 'comment-0002',
        username: 'wirasatrian',
        date: '2023-08-24T09:19:09.775Z',
        content: 'You should start learning ...and enjoy it :)',
        replies: [],
        isDeleted: true,
      }),
    ];

    const mockChangedComments = [
      {
        id: 'comment-0001',
        username: 'abhi',
        date: '2023-08-24T07:19:09.775Z',
        replies: [],
        content: 'is Javascript easy ?',
      },
      {
        id: 'comment-0002',
        username: 'wirasatrian',
        date: '2023-08-24T09:19:09.775Z',
        replies: [],
        content: '**komentar telah dihapus**',
      },
    ];

    const mockReplies = [
      new ReplyDetail({
        id: 'reply-0001',
        content: 'Small step to start learning will go further in the long run :)',
        date: '2023-08-29T07:19:09.775Z',
        username: 'wirasatrian',
        isDeleted: false,
      }),
      new ReplyDetail({
        id: 'reply-0002',
        username: 'abhi',
        date: '2023-08-29T09:19:09.775Z',
        content: 'It is difficult for me to understand..LOL',
        isDeleted: true,
      }),
    ];

    const mockChangedReplies = [
      {
        id: 'reply-0001',
        content: 'Small step to start learning will go further in the long run :)',
        date: '2023-08-29T07:19:09.775Z',
        username: 'wirasatrian',
      },
      {
        id: 'reply-0002',
        username: 'abhi',
        date: '2023-08-29T09:19:09.775Z',
        content: '**balasan telah dihapus**',
      },
    ];

    // creating dependency
    const mockThreadRepository = new ThreadRepository();
    const mockCommenRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    // mocking
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockDetailThread));
    mockCommenRepository.getCommentsByThreadId = jest.fn().mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentId = jest.fn().mockImplementation(() => Promise.resolve(mockReplies));

    // Create the use case instace
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommenRepository,
      replyRepository: mockReplyRepository,
    });

    getThreadUseCase._changeDeletedComment = jest.fn().mockImplementation((mockComments) => mockChangedComments);
    getThreadUseCase._changeDeletedReply = jest.fn().mockImplementation((mockReplies) => mockChangedReplies);
    mockChangedComments.replies = mockChangedReplies;

    // Action
    const threadDetail = await getThreadUseCase.execute(useCaseEndpointParameter);

    // Assert
    expect(threadDetail).toEqual(
      new ThreadDetail({
        ...mockDetailThread,
        comments: mockChangedComments,
      })
    );

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseEndpointParameter);
    expect(mockCommenRepository.getCommentsByThreadId).toBeCalledWith(useCaseEndpointParameter);
    expect(getThreadUseCase._changeDeletedComment).toBeCalledWith(mockComments);
    expect(getThreadUseCase._changeDeletedReply).toBeCalledWith(mockReplies);
  });
});
