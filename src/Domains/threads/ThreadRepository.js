class ThreadRepository {
  async createThread(thread) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyAvailabilityThread(threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ThreadRepository;
