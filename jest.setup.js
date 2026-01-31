// Mock react-native-get-random-values
jest.mock('react-native-get-random-values', () => ({
  default: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock uuid to return predictable values in tests
let mockUuidCounter = 0;
jest.mock('uuid', () => ({
  v4: () => `test-uuid-${++mockUuidCounter}`,
}));

// Reset uuid counter before each test
beforeEach(() => {
  mockUuidCounter = 0;
});

// Silence console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('Animated:'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') ||
       args[0].includes('not wrapped in act('))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
