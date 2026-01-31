// Mock react-native-get-random-values
jest.mock('react-native-get-random-values', () => ({
  default: jest.fn(),
}))

// Mock uuid to use a simple implementation
let mockUuidCounter = 0
jest.mock('uuid', () => ({
  v4: () => `test-uuid-${++mockUuidCounter}`,
}))

// Mock AsyncStorage using global storage
global.__mockAsyncStorage = new Map()

const mockAsyncStorage = {
  getItem: jest.fn((key) => Promise.resolve(global.__mockAsyncStorage.get(key) || null)),
  setItem: jest.fn((key, value) => {
    global.__mockAsyncStorage.set(key, value)
    return Promise.resolve()
  }),
  removeItem: jest.fn((key) => {
    global.__mockAsyncStorage.delete(key)
    return Promise.resolve()
  }),
  clear: jest.fn(() => {
    global.__mockAsyncStorage.clear()
    return Promise.resolve()
  }),
}

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
}))

// Reset mocks and storage before each test
beforeEach(() => {
  global.__mockAsyncStorage.clear()
  mockUuidCounter = 0
  mockAsyncStorage.getItem.mockClear()
  mockAsyncStorage.setItem.mockClear()
  mockAsyncStorage.removeItem.mockClear()
  mockAsyncStorage.clear.mockClear()
})
