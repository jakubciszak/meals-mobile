import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../../screens/HomeScreen';

// Mock expo-file-system and expo-sharing
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: { UTF8: 'utf8' },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    Picker: ({ children, selectedValue, onValueChange, testID }: any) => (
      <View testID={testID || 'picker'}>
        {React.Children.map(children, (child: any) => (
          <Text
            testID={`picker-item-${child.props.value}`}
            onPress={() => onValueChange(child.props.value)}
          >
            {child.props.label}
          </Text>
        ))}
      </View>
    ),
  };
});

describe('HomeScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('ingredients input', () => {
    it('should show ingredients toggle button', async () => {
      const { getByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText('Dodaj składniki (opcjonalnie)')).toBeTruthy();
      });
    });

    it('should show ingredients input when toggle is pressed', async () => {
      const { getByText, getByPlaceholderText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText('Dodaj składniki (opcjonalnie)')).toBeTruthy();
      });

      fireEvent.press(getByText('Dodaj składniki (opcjonalnie)'));

      expect(getByPlaceholderText('np. kurczak, ryż, warzywa')).toBeTruthy();
    });

    it('should add meal with ingredients', async () => {
      const { getByText, getByPlaceholderText, getAllByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByPlaceholderText('Co było na obiad?')).toBeTruthy();
      });

      // Add meal name
      fireEvent.changeText(getByPlaceholderText('Co było na obiad?'), 'Kurczak z ryżem');

      // Toggle ingredients and add them
      fireEvent.press(getByText('Dodaj składniki (opcjonalnie)'));
      fireEvent.changeText(getByPlaceholderText('np. kurczak, ryż, warzywa'), 'kurczak, ryż, marchewka');

      // Add meal
      fireEvent.press(getByText('Dodaj'));

      await waitFor(() => {
        expect(getByText('Kurczak z ryżem')).toBeTruthy();
        // Multiple elements may match (in filter dropdown and as ingredient tags)
        expect(getAllByText('kurczak').length).toBeGreaterThanOrEqual(1);
        expect(getAllByText('ryż').length).toBeGreaterThanOrEqual(1);
        expect(getAllByText('marchewka').length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('day navigation', () => {
    it('should display date navigation arrows', async () => {
      const { getByLabelText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByLabelText('Poprzedni dzień')).toBeTruthy();
        expect(getByLabelText('Następny dzień')).toBeTruthy();
      });
    });

    it('should navigate to previous day when left arrow is pressed', async () => {
      const { getByLabelText, getByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText('Dzisiaj')).toBeTruthy();
      });

      fireEvent.press(getByLabelText('Poprzedni dzień'));

      await waitFor(() => {
        expect(getByText('Wczoraj')).toBeTruthy();
      });
    });

    it('should disable next day button when on today', async () => {
      const { getByLabelText, getByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText('Dzisiaj')).toBeTruthy();
      });

      const nextButton = getByLabelText('Następny dzień');
      expect(nextButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should enable next day button when on past date', async () => {
      const { getByLabelText, getByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText('Dzisiaj')).toBeTruthy();
      });

      // Go to yesterday
      fireEvent.press(getByLabelText('Poprzedni dzień'));

      await waitFor(() => {
        expect(getByText('Wczoraj')).toBeTruthy();
      });

      // Next button should be enabled now
      const nextButton = getByLabelText('Następny dzień');
      expect(nextButton.props.accessibilityState?.disabled).toBeFalsy();
    });

    it('should navigate back to today from yesterday', async () => {
      const { getByLabelText, getByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText('Dzisiaj')).toBeTruthy();
      });

      // Go to yesterday
      fireEvent.press(getByLabelText('Poprzedni dzień'));
      await waitFor(() => {
        expect(getByText('Wczoraj')).toBeTruthy();
      });

      // Go back to today
      fireEvent.press(getByLabelText('Następny dzień'));
      await waitFor(() => {
        expect(getByText('Dzisiaj')).toBeTruthy();
      });
    });
  });

  describe('filtering', () => {
    it('should show filter picker for family members', async () => {
      const { getByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText('Wszystkie osoby')).toBeTruthy();
      });
    });

    it('should show filter picker for ingredients', async () => {
      const { getByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText('Wszystkie składniki')).toBeTruthy();
      });
    });

    it('should show clear filters button when filter is active', async () => {
      // First add a family member and a meal with ingredients
      await AsyncStorage.setItem('my-meals-family', JSON.stringify({
        members: [{ id: 'member-1', name: 'Jan', createdAt: '2024-01-01T00:00:00.000Z' }]
      }));

      const { getByTestId, getByText, queryByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText('Wszystkie osoby')).toBeTruthy();
      });

      // Initially, clear filters button should not be visible
      expect(queryByText('Wyczyść filtry')).toBeNull();

      // Select a filter (simulated by pressing picker item)
      fireEvent.press(getByTestId('picker-item-member-1'));

      await waitFor(() => {
        expect(getByText('Wyczyść filtry')).toBeTruthy();
      });
    });
  });

  describe('meal display', () => {
    it('should display empty state message', async () => {
      const { getByText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByText(/Brak obiadów na dziś/)).toBeTruthy();
      });
    });

    it('should display added meal', async () => {
      const { getByText, getByPlaceholderText } = render(<HomeScreen />);

      await waitFor(() => {
        expect(getByPlaceholderText('Co było na obiad?')).toBeTruthy();
      });

      fireEvent.changeText(getByPlaceholderText('Co było na obiad?'), 'Pierogi');
      fireEvent.press(getByText('Dodaj'));

      await waitFor(() => {
        expect(getByText('Pierogi')).toBeTruthy();
      });
    });
  });
});
