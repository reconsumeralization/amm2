/**
 * Semantic Version Utilities
 *
 * Provides functions to parse, compare, and validate semantic version strings
 * following the MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD] format.
 */

export interface SemVer {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

/**
 * Parse a semantic version string into its components.
 * Returns null if the version string is invalid.
 */
export function parseVersion(version: string): SemVer | null {
  const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?(?:\+([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?$/;
  const match = version.match(regex);
  if (!match) return null;

  const [, major, minor, patch, prerelease, build] = match;
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease: prerelease,
    build: build,
  };
}

/**
 * Compare two semantic versions.
 * Returns:
 *   -1 if a < b
 *    0 if a == b
 *    1 if a > b
 */
export function compareVersions(a: string, b: string): number {
  const vA = parseVersion(a);
  const vB = parseVersion(b);
  if (!vA || !vB) {
    throw new Error('Invalid semantic version string');
  }

  // Compare major, minor, patch
  if (vA.major !== vB.major) return vA.major > vB.major ? 1 : -1;
  if (vA.minor !== vB.minor) return vA.minor > vB.minor ? 1 : -1;
  if (vA.patch !== vB.patch) return vA.patch > vB.patch ? 1 : -1;

  // Handle prerelease (absence > presence)
  if (vA.prerelease && !vB.prerelease) return -1;
  if (!vA.prerelease && vB.prerelease) return 1;
  if (vA.prerelease && vB.prerelease) {
    if (vA.prerelease !== vB.prerelease) {
      return vA.prerelease > vB.prerelease ? 1 : -1;
    }
  }

  return 0;
}

/**
 * Check if a version satisfies a simple range expression.
 * Supported operators: =, >, >=, <, <=
 * Example: satisfies('1.2.3', '>=1.0.0')
 */
export function satisfies(version: string, range: string): boolean {
  const operatorMatch = range.match(/^(=|>=|<=|>|<)\s*(.+)$/);
  if (!operatorMatch) {
    throw new Error('Invalid range expression');
  }
  const [, operator, target] = operatorMatch;
  const cmp = compareVersions(version, target);

  switch (operator) {
    case '=':
      return cmp === 0;
    case '>':
      return cmp === 1;
    case '>=':
      return cmp === 1 || cmp === 0;
    case '<':
      return cmp === -1;
    case '<=':
      return cmp === -1 || cmp === 0;
    default:
      return false;
  }
}
