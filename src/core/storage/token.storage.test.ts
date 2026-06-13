describe('TokenStorage por plataforma', () => {
  const createStorage = (): Storage => {
    const values = new Map<string, string>();
    return {
      get length() { return values.size; },
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      key: (index) => Array.from(values.keys())[index] ?? null,
      removeItem: (key) => { values.delete(key); },
      setItem: (key, value) => { values.set(key, value); },
    };
  };

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: createStorage(),
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: createStorage(),
  });

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.dontMock('@/core/platform');
    jest.dontMock('expo-secure-store');
  });

  it('guarda la sesion web en localStorage y sessionStorage', async () => {
    jest.doMock('@/core/platform', () => ({ isWeb: true }));
    jest.doMock('expo-secure-store', () => ({
      setItemAsync: jest.fn(),
      getItemAsync: jest.fn(),
      deleteItemAsync: jest.fn(),
    }));
    const { TokenStorage } = require('./token.storage') as typeof import('./token.storage');

    await TokenStorage.setToken('web-token');

    expect(localStorage.getItem('auth_token')).toBe('web-token');
    expect(sessionStorage.getItem('auth_token')).toBe('web-token');
    await expect(TokenStorage.getToken()).resolves.toBe('web-token');
  });

  it('guarda la sesion Android con SecureStore', async () => {
    const secureStore = {
      setItemAsync: jest.fn().mockResolvedValue(undefined),
      getItemAsync: jest.fn().mockResolvedValue('android-token'),
      deleteItemAsync: jest.fn().mockResolvedValue(undefined),
    };
    jest.doMock('@/core/platform', () => ({ isWeb: false }));
    jest.doMock('expo-secure-store', () => secureStore);
    const { TokenStorage } = require('./token.storage') as typeof import('./token.storage');

    await TokenStorage.setToken('android-token');
    await expect(TokenStorage.getToken()).resolves.toBe('android-token');
    await TokenStorage.removeToken();

    expect(secureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'android-token');
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
  });
});
