// Set up global __ExpoImportMetaRegistry before expo loads
global.__ExpoImportMetaRegistry = {
  get: () => ({}),
  set: () => {},
};
