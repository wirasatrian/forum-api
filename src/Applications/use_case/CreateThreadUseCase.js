const CreateThread = require('../../Domains/threads/entities/CreateThread');

class CreateThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, userId) {
    const thread = new CreateThread({ ...useCasePayload, owner: userId });
    return this._threadRepository.createThread(thread);
  }
}

module.exports = CreateThreadUseCase;
