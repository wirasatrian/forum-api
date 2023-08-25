const ThreadDetail = require('../ThreadDetail');

describe('a ThreadDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'Thread-0001',
      title: 'Javascript',
      username: 'Wira Satria Negara',
      comments: [],
    };

    // Action and Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'Thread-0001',
      title: {},
      body: 'Belajar bahasa pemrograman Javascript',
      date: '2023-08-23T07:19:09.775Z',
      username: 1234,
      comments: 'just comment',
    };

    // Action and Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ThreadDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'Thread-0001',
      title: 'Javascript',
      body: 'Belajar bahasa pemrograman Javascript',
      date: '2023-08-23T07:19:09.775Z',
      username: 'Wira Satria Negara',
      comments: [],
    };

    // Action
    const threadDetail = new ThreadDetail(payload);

    // Assert
    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);
    expect(threadDetail.comments).toEqual(payload.comments);
  });
});
