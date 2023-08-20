const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadCommentHandler = this.postThreadCommentHandler.bind(this);
  }

  async postThreadCommentHandler(request, h) {
    const header = request.headers['authorization'];
    const { threadId } = request.params;
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute(threadId, header, request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = CommentsHandler;
