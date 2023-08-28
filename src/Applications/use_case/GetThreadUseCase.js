const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseEndpointParameter) {
    const threadId = useCaseEndpointParameter;
    const thread = await this._threadRepository.getThreadById(threadId);

    // get replies on each comment and change deleted reply into /**komentar telah dihapus**/
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    for (let index = 0; index < comments.length; index++) {
      const comment = comments[index];
      const replies = await this._replyRepository.getRepliesByCommentId(comment.id);
      comments[index].replies = this._changeDeletedReply(replies);
    }

    thread.comments = comments;

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
        replies: comment.replies,
        content: comment.isDeleted ? '**komentar telah dihapus**' : comment.content,
      };
    });
    return changeComments;
  }

  _changeDeletedReply(replies) {
    const changeReplies = replies.map((reply) => {
      return {
        id: reply.id,
        content: reply.isDeleted ? '**balasan telah dihapus**' : reply.content,
        date: reply.date,
        username: reply.username,
      };
    });
    return changeReplies;
  }
}

module.exports = GetThreadUseCase;
