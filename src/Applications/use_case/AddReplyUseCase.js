const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, authenticationTokenManager }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseEndpointParameter, useCaseHeader, useCasePayload) {
    const accessToken = await this._authenticationTokenManager.getAccessTokenFromHeader(useCaseHeader);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);
    await this._commentRepository.verifyCommentAvailability({ ...useCaseEndpointParameter });
    const reply = new AddReply({
      content: useCasePayload.content,
      commentId: useCaseEndpointParameter.commentId,
      owner: owner,
    });
    return this._replyRepository.addReply(reply);
  }
}

module.exports = AddReplyUseCase;
