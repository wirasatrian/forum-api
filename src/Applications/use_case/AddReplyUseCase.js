const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseEndpointParameter, userId, useCasePayload) {
    await this._commentRepository.verifyCommentAvailability({ ...useCaseEndpointParameter });
    const reply = new AddReply({
      content: useCasePayload.content,
      commentId: useCaseEndpointParameter.commentId,
      owner: userId,
    });
    return this._replyRepository.addReply(reply);
  }
}

module.exports = AddReplyUseCase;
