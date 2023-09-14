class DeleteReplyUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(useCaseEndpointParameter, userId) {
    // const { threadId, commentId, replyId } = useCaseEndpointParameter;
    const { replyId } = useCaseEndpointParameter;
    await this._replyRepository.verifyReplyAvailability(useCaseEndpointParameter);
    await this._replyRepository.verifyReplyOwner({ owner: userId, replyId });
    await this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
