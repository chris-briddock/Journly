const GoogleProvider = jest.fn(() => ({
  id: 'google',
  name: 'Google',
  type: 'oauth',
  authorization: {
    params: {
      prompt: 'consent',
      access_type: 'offline',
      response_type: 'code',
    },
  },
}));

module.exports = GoogleProvider;
