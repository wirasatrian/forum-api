const CreatedThread = require('../CreatedThread');

describe('CreatedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-00001',
      title: 'Bahasa Pemrograman',
    };

    // Action and Assert
    expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-00001',
      title: 123,
      owner: Boolean('123'),
    };

    // Action and Assert
    expect(() => new CreatedThread(payload)).toThrowError('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Thread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-00001',
      title: 'Javascript',
      owner: 'wirasatrian',
    };

    // Action
    const { id, title, owner } = new CreatedThread(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
