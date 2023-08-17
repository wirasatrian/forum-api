const CreateThreadUseCase = require('../../../../Applications/use_case/CreateThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const header = request.headers['authorization'];
    const createThreadUseCase = this._container.getInstance(CreateThreadUseCase.name);
    const addedThread = await createThreadUseCase.execute(request.payload, header);
    
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadsHandler;
