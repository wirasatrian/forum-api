class ReplyDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, content, date, username, isDeleted } = payload;

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
    this.isDeleted = isDeleted;
  }

  _verifyPayload({ id, content, date, username, isDeleted }) {
    if (!id || !username || !date || !content || !isDeleted === undefined) {
      throw new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof date !== 'string' ||
      typeof content !== 'string' ||
      typeof isDeleted !== 'boolean'
    ) {
      throw new Error('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyDetail;
