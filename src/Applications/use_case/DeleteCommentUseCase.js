class DeleteCommentUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCaseEndpointParameter, useCaseHeader) {
    const { threadId, commentId } = useCaseEndpointParameter;
    const accessToken = await this._authenticationTokenManager.getAccessTokenFromHeader(useCaseHeader);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);
    await this._commentRepository.verifyCommentAvailability({ threadId, commentId });
    await this._commentRepository.verifyCommentOwner({ owner, commentId });
    await this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
