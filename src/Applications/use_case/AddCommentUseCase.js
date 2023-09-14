const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCaseEndpointParameter, userId, useCasePayload) {
    await this._threadRepository.verifyAvailabilityThread(useCaseEndpointParameter);
    const comment = new AddComment({
      content: useCasePayload.content,
      threadId: useCaseEndpointParameter,
      owner: userId,
    });

    return this._commentRepository.addComment(comment);
  }
}

module.exports = AddCommentUseCase;
