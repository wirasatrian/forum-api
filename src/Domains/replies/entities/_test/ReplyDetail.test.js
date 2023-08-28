const ReplyDetail = require('../ReplyDetail');

describe('a ReplyDetail entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-0001',
      username: 'Wira Satria Negara',
      isDeleted: true,
    };

    // Action and Assert
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-0001',
      username: 123,
      date: '2023-08-25T20:19:09.775Z',
      content: {},
    };

    // Action and Assert
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ReplyDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-0001',
      username: 'Wira Satria Negara',
      date: '2023-08-25T20:19:09.775Z',
      content: 'Not easy if you do not have another basic programming knowledge',
      isDeleted: false,
    };

    // Action
    const replyDetail = new ReplyDetail(payload);

    // Assert
    expect(replyDetail.id).toEqual(payload.id);
    expect(replyDetail.username).toEqual(payload.username);
    expect(replyDetail.date).toEqual(payload.date);
    expect(replyDetail.content).toEqual(payload.content);
    expect(replyDetail.isDeleted).toEqual(payload.isDeleted);
  });
});
