const CredentialsProvider = jest.fn(() => ({
  id: 'credentials',
  name: 'Credentials',
  type: 'credentials',
  credentials: {},
  authorize: jest.fn(),
}));

module.exports = CredentialsProvider;
