jest.mock('react-native-webview', () => ({WebView: 'WebView'}));

/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shiped with jest.
import {it, jest} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  let tree: renderer.ReactTestRenderer;
  renderer.act(() => { tree = renderer.create(<App />); });
  renderer.act(() => { tree.unmount(); });
});
