class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, date, content, isDeleted } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.isDeleted = isDeleted;
  }

  _verifyPayload({ id, username, date, content, isDeleted }) {
    if (!id || !username || !date || !content || !isDeleted === undefined) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      typeof content !== 'string' ||
      typeof isDeleted !== 'boolean'
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetail;
