exports.up = (pgm) => {
  pgm.addColumn('comments', {
    is_delete: {
      type: 'BOOLEAN',
      isNullable: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('comments', 'is_delete');
};
