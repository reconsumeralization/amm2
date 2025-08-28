/**
 * Global declarations for Jest test environment.
 * Provides a lightweight set of typings for Jest globals and matchers
 * to allow the project to compile without installing @types/jest.
 */

declare var describe: (title: string, fn: () => void) => void;
declare var test: (title: string, fn: () => void) => void;
declare var it: (title: string, fn: () => void) => void;
declare var beforeEach: (fn: () => void) => void;
declare var afterEach: (fn: () => void) => void;
declare var beforeAll: (fn: () => void) => void;
declare var afterAll: (fn: () => void) => void;

/**
 * Generic matcher interface that accepts any matcher name.
 * This covers the extensive set of Jest matchers used in the test suite.
 */
interface JestMatchers<T = any> {
  [matcher: string]: (...args: any[]) => any;
  not?: JestMatchers<T>;
}

/**
 * Expect function returning a matcher set.
 */
declare function expect<T = any>(actual: T): JestMatchers<T>;

declare namespace jest {
  /**
   * Mock function creator – returns any to allow chaining mock methods.
   */
  const fn: any;

  /**
   * Spy on an object method – returns any to allow mock chaining.
   */
  function spyOn<T>(obj: T, methodName: keyof T): any;

  /**
   * Generic mock placeholder.
   */
  const mock: any;

  /**
   * Clears all mock calls and instances.
   */
  function clearAllMocks(): void;

  /**
   * Represents a mocked function with common Jest mock methods.
   */
  type MockedFunction<T = any> = {
    (...args: any[]): any;
    mockReturnValue(value: any): any;
    mockReturnValueOnce(value: any): any;
    mockImplementation(fn: (...args: any[]) => any): any;
    mock?: any;
  };

  /**
   * Maps a module's exported members to mocked equivalents.
   */
  type Mocked<T> = {
    [P in keyof T]?: any;
  };

  /**
   * Mock type placeholder.
   */
  type Mock<T = any> = any;

  /**
   * Mock constructor placeholder.
   */
  const Mock: any;
}
