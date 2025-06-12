if (typeof window === 'undefined') {
  global.window = {};
}
if (!global.window.localStorage) {
  let store = {};
  global.window.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
  global.localStorage = global.window.localStorage;
} 