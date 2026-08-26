import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { resetSharedClocks } from '@glyphy/core';

afterEach(() => {
  cleanup();
  resetSharedClocks();
});
