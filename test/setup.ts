import { cdp } from 'vitest/browser';
import './test.css';

beforeEach(async () => {
  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: -1, y: -1 });
});
