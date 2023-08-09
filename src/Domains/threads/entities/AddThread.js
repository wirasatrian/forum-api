class AddThread {
  constructor({ title, body }) {
    if (!title || !body) {
      throw new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = AddThread;
