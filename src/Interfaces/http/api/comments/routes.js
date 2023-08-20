const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postThreadCommentHandler,
  }
];

module.exports = routes;
