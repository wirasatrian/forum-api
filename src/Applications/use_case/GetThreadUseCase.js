const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseEndpointParameter) {
    const threadId = useCaseEndpointParameter;
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    return new ThreadDetail({ ...thread, comments });
  }
}

module.exports = GetThreadUseCase;
