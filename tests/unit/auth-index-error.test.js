jest.mock('../../src/auth/basic-auth', () => {
  throw new Error('Basic Auth error');
});
jest.mock('../../src/auth/cognito', () => {
  throw new Error('Cognito error');
});

describe('Auth index.js error handling', () => {
  test('throws when no valid auth strategy is found', () => {
    expect(() => require('../../src/auth/index')).toThrow();
  });
});
