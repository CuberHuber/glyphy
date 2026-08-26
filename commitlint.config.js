/**
 * Commit messages are the project's log. They are read far more often than
 * they are written, so they are linted like anything else that ships.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [1, 'always', 100],
    'scope-enum': [
      2,
      'always',
      ['core', 'react', 'motion', 'tailwind', 'example', 'ci', 'deps', 'docs', 'repo'],
    ],
  },
};
