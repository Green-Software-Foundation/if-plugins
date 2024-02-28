module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'chore',
        'style',
        'refactor',
        'ci',
        'test',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'util',
        'lib',
        'types',
        'src',
        'package',
        'config',
        'mocks',
        'examples',
        '.github',
        '.husky',
        'scripts'
      ]
    ],
    'scope-empty': [
      2, 
      'never'
    ]
  },
};
