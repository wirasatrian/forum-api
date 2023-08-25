const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseEndpointParameter) {
    const threadId = useCaseEndpointParameter;
    const thread = await this._threadRepository.getThreadById(threadId);
    thread.comments = await this._commentRepository.getCommentsByThreadId(threadId);
    // change deleted comment into /**komentar telah dihapus**/
    thread.comments = this._changeDeletedComment(thread.comments);
    return new ThreadDetail(thread);
  }

  _changeDeletedComment(comments) {
    const changeComments = comments.map((comment) => {
      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.isDeleted ? '**komentar telah dihapus**' : comment.content,
      };
    });
  }
}

module.exports = GetThreadUseCase;
