const AddReply = require('../AddReply');

describe('An AddReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Not easy if you do not have another basic programming knowledge',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
      commentId: {},
      owner: 999,
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Replies object correctly', () => {
    // Arrange
    const payload = {
      content: 'Not easy if you do not have another basic programming knowledge',
      commentId: 'comment-0001',
      owner: 'user-123',
    };

    // Action
    const { content, commentId, owner } = new AddReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
  });
});
