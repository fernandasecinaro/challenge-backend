module.exports = [
  {
    script: 'dist/index.js',
    name: 'familyCosts',
    exec_mode: 'cluster',
    instances: 'max',

    env: {
      NODE_PATH: './dist',
      NODE_OPTIONS: '--max_old_space_size=4096',
    },
  },
];
