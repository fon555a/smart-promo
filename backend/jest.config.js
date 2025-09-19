/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm', // ใช้ preset สำหรับ ESM
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],      // ให้ Jest รู้ว่า .ts คือ ESM
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }] // ตั้งค่า ts-jest ตรงนี้แทน globals
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'       // แก้ปัญหา import path หลัง build
  }
}
