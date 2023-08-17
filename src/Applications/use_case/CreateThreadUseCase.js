const CreateThread = require('../../Domains/threads/entities/CreateThread');

class CreateThreadUseCase {
  constructor({ threadRepository, authenticationTokenManager }) {
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, useCaseHeader) {
    const accessToken = await this._authenticationTokenManager.getAccessTokenFromHeader(useCaseHeader);
    await this._authenticationTokenManager.verifyAccessToken(accessToken);
    const { id: owner } = await this._authenticationTokenManager.decodePayload(accessToken);
    const thread = new CreateThread({ ...useCasePayload, owner });
    return this._threadRepository.createThread(thread);
  }
}

module.exports = CreateThreadUseCase;
