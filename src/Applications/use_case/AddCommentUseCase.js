const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseEndpointParameter, useCaseHeader, useCasePayload) {
    const accessToken = await this._authenticationTokenManager.getAccessTokenFromHeader(useCaseHeader);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);
    await this._threadRepository.verifyAvailabilityThread(useCaseEndpointParameter);
    const comment = new AddComment({
      content: useCasePayload.content,
      threadId: useCaseEndpointParameter,
      owner,
    });
    return this._commentRepository.addComment(comment);
  }
}

module.exports = AddCommentUseCase;
