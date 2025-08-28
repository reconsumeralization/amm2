import '@testing-library/jest-dom';
import 'whatwg-fetch';

global.renderHook = (hook) => {
  let result;
  function TestComponent() {
    result = hook();
    return null;
  }
  return result;
};