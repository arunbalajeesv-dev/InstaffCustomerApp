/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { OtpScreen } from '../src/screens/OtpScreen';
import { useAuthStore } from '../src/store/useAuthStore';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({ params: { phone: '+919876543210' } }),
}));

const initialAuthState = useAuthStore.getState();
const mockConfirm = jest.fn();
let currentTree: ReactTestRenderer.ReactTestRenderer | undefined;

beforeEach(() => {
  mockConfirm.mockReset();
  useAuthStore.setState({ ...initialAuthState, confirmation: { confirm: mockConfirm } as never }, true);
});

afterEach(() => {
  if (currentTree) {
    ReactTestRenderer.act(() => {
      currentTree!.unmount();
    });
    currentTree = undefined;
  }
});

function render() {
  ReactTestRenderer.act(() => {
    currentTree = ReactTestRenderer.create(<OtpScreen />);
  });
  return currentTree!;
}

function box(tree: ReactTestRenderer.ReactTestRenderer, index: number) {
  return tree.root.findByProps({ testID: `otpBox-${index}` });
}

test('typing one digit per box fills them left to right', async () => {
  const tree = render();

  for (let i = 0; i < 5; i++) {
    await ReactTestRenderer.act(() => {
      box(tree, i).props.onChangeText(String(i + 1));
    });
  }

  for (let i = 0; i < 5; i++) {
    expect(box(tree, i).props.value).toBe(String(i + 1));
  }
  expect(mockConfirm).not.toHaveBeenCalled(); // only 5 of 6 filled
});

test('filling the 6th box auto-verifies with the full code', async () => {
  mockConfirm.mockResolvedValue({ user: { uid: 'fb-1' } });
  const tree = render();

  for (let i = 0; i < 6; i++) {
    await ReactTestRenderer.act(async () => {
      await box(tree, i).props.onChangeText(String(i + 1));
    });
  }

  expect(mockConfirm).toHaveBeenCalledWith('123456');
});

test('pasting all 6 digits into the first box distributes them and auto-verifies', async () => {
  mockConfirm.mockResolvedValue({ user: { uid: 'fb-1' } });
  const tree = render();

  await ReactTestRenderer.act(async () => {
    await box(tree, 0).props.onChangeText('123456');
  });

  for (let i = 0; i < 6; i++) {
    expect(box(tree, i).props.value).toBe(String(i + 1));
  }
  expect(mockConfirm).toHaveBeenCalledWith('123456');
});

test('backspace on an empty box clears and moves back to the previous one', async () => {
  const tree = render();

  await ReactTestRenderer.act(() => {
    box(tree, 0).props.onChangeText('1');
  });
  await ReactTestRenderer.act(() => {
    box(tree, 1).props.onKeyPress({ nativeEvent: { key: 'Backspace' } });
  });

  expect(box(tree, 0).props.value).toBe('');
});

test('an incorrect code shows an error and clears all boxes', async () => {
  mockConfirm.mockRejectedValue(new Error('Incorrect code.'));
  const tree = render();

  for (let i = 0; i < 6; i++) {
    await ReactTestRenderer.act(async () => {
      await box(tree, i).props.onChangeText(String(i + 1));
    });
  }

  const texts = tree.root.findAllByType(require('react-native').Text).map(t => t.props.children);
  expect(texts).toContain('Incorrect code.');
  for (let i = 0; i < 6; i++) {
    expect(box(tree, i).props.value).toBe('');
  }
});

test('Verify button is disabled until all 6 boxes are filled', async () => {
  const tree = render();

  expect(tree.root.findByProps({ testID: 'verifyButton' }).props.disabled).toBe(true);

  for (let i = 0; i < 6; i++) {
    await ReactTestRenderer.act(() => {
      box(tree, i).props.onChangeText(String(i + 1));
    });
  }

  expect(tree.root.findByProps({ testID: 'verifyButton' }).props.disabled).toBe(false);
});
