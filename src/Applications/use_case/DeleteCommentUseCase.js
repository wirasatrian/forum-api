class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCaseEndpointParameter, userId) {
    const { threadId, commentId } = useCaseEndpointParameter;
    await this._commentRepository.verifyCommentAvailability({ threadId, commentId });
    await this._commentRepository.verifyCommentOwner({ owner: userId, commentId });
    await this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
