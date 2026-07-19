// ESM Jest (project is "type": "module") — no transform, run via
// NODE_OPTIONS=--experimental-vm-modules (see the "test" script).
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000,
};
