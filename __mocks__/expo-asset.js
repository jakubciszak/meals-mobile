module.exports = {
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn(),
      uri: 'mock-uri',
    })),
    loadAsync: jest.fn(),
  },
};
