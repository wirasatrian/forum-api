class DeleteReplyUseCase {
  constructor({ replyRepository, authenticationTokenManager }) {
    this._replyRepository = replyRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseEndpointParameter, useCaseHeader) {
    const { threadId, commentId, replyId } = useCaseEndpointParameter;
    const accessToken = await this._authenticationTokenManager.getAccessTokenFromHeader(useCaseHeader);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);
    await this._replyRepository.verifyReplyAvailability({ threadId, commentId, replyId });
    await this._replyRepository.verifyReplyOwner({ owner, replyId });
    await this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
