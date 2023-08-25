const CommentDetail = require('../CommentDetail');

describe('a CommentDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-0001',
      username: 'Abhi Satria',
      date: '2023-08-24T07:19:09.775Z',
      isDeleted: true,
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-0001',
      username: 123,
      date: '2023-08-24T07:19:09.775Z',
      content: {},
    };

    // Action and Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-0001',
      username: 'Abhi Satria',
      date: '2023-08-24T07:19:09.775Z',
      content: 'is Javascript easy ?',
      isDeleted: false,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.isDeleted).toEqual(payload.isDeleted);
  });
});
