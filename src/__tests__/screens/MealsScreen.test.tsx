import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import MealsScreen from '../../screens/MealsScreen';

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

describe('MealsScreen', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should display title', async () => {
      const { getByText } = render(<MealsScreen />);

      await waitFor(() => {
        expect(getByText('Historia obiadów')).toBeTruthy();
      });
    });

    it('should display subtitle', async () => {
      const { getByText } = render(<MealsScreen />);

      await waitFor(() => {
        expect(getByText('Przeglądaj wcześniejsze posiłki')).toBeTruthy();
      });
    });

    it('should display empty state when no meals', async () => {
      const { getByText } = render(<MealsScreen />);

      await waitFor(() => {
        expect(getByText('Brak zapisanych obiadów.')).toBeTruthy();
      });
    });
  });

  describe('CSV export', () => {
    it('should not show export button when no meals', async () => {
      const { queryByLabelText } = render(<MealsScreen />);

      await waitFor(() => {
        expect(queryByLabelText('Eksportuj do CSV')).toBeNull();
      });
    });

    it('should show export button when meals exist', async () => {
      await AsyncStorage.setItem('my-meals-data', JSON.stringify({
        meals: [{
          id: 'meal-1',
          name: 'Test Meal',
          date: '2024-01-15',
          ratings: [],
          createdAt: '2024-01-15T12:00:00.000Z',
          updatedAt: '2024-01-15T12:00:00.000Z',
        }]
      }));

      const { getByLabelText } = render(<MealsScreen />);

      await waitFor(() => {
        expect(getByLabelText('Eksportuj do CSV')).toBeTruthy();
      });
    });

    it('should trigger export when button is pressed', async () => {
      await AsyncStorage.setItem('my-meals-data', JSON.stringify({
        meals: [{
          id: 'meal-1',
          name: 'Export Meal',
          date: '2024-01-15',
          ratings: [],
          createdAt: '2024-01-15T12:00:00.000Z',
          updatedAt: '2024-01-15T12:00:00.000Z',
        }]
      }));

      const { getByLabelText } = render(<MealsScreen />);

      await waitFor(() => {
        expect(getByLabelText('Eksportuj do CSV')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByLabelText('Eksportuj do CSV'));
      });

      await waitFor(() => {
        expect(Sharing.shareAsync).toHaveBeenCalled();
      });
    });

    it('should display CSV button text', async () => {
      await AsyncStorage.setItem('my-meals-data', JSON.stringify({
        meals: [{
          id: 'meal-1',
          name: 'Test Meal',
          date: '2024-01-15',
          ratings: [],
          createdAt: '2024-01-15T12:00:00.000Z',
          updatedAt: '2024-01-15T12:00:00.000Z',
        }]
      }));

      const { getByText } = render(<MealsScreen />);

      await waitFor(() => {
        expect(getByText('CSV')).toBeTruthy();
      });
    });
  });

  describe('meal display', () => {
    it('should display meals grouped by date', async () => {
      await AsyncStorage.setItem('my-meals-data', JSON.stringify({
        meals: [
          {
            id: 'meal-1',
            name: 'Spaghetti',
            date: '2024-01-15',
            ratings: [],
            createdAt: '2024-01-15T12:00:00.000Z',
            updatedAt: '2024-01-15T12:00:00.000Z',
          },
          {
            id: 'meal-2',
            name: 'Pizza',
            date: '2024-01-16',
            ratings: [],
            createdAt: '2024-01-16T12:00:00.000Z',
            updatedAt: '2024-01-16T12:00:00.000Z',
          }
        ]
      }));

      const { getByText } = render(<MealsScreen />);

      await waitFor(() => {
        expect(getByText('Spaghetti')).toBeTruthy();
        expect(getByText('Pizza')).toBeTruthy();
      });
    });

    it('should display meal ingredients', async () => {
      await AsyncStorage.setItem('my-meals-data', JSON.stringify({
        meals: [{
          id: 'meal-1',
          name: 'Chicken Curry',
          date: '2024-01-15',
          ratings: [],
          ingredients: ['kurczak', 'curry', 'ryż'],
          createdAt: '2024-01-15T12:00:00.000Z',
          updatedAt: '2024-01-15T12:00:00.000Z',
        }]
      }));

      const { getByText } = render(<MealsScreen />);

      await waitFor(() => {
        expect(getByText('Składniki: kurczak, curry, ryż')).toBeTruthy();
      });
    });

    it('should display meal ratings', async () => {
      await AsyncStorage.setItem('my-meals-family', JSON.stringify({
        members: [{ id: 'member-1', name: 'Jan', createdAt: '2024-01-01T00:00:00.000Z' }]
      }));

      await AsyncStorage.setItem('my-meals-data', JSON.stringify({
        meals: [{
          id: 'meal-1',
          name: 'Rated Meal',
          date: '2024-01-15',
          ratings: [{ memberId: 'member-1', liked: true }],
          createdAt: '2024-01-15T12:00:00.000Z',
          updatedAt: '2024-01-15T12:00:00.000Z',
        }]
      }));

      const { getByText } = render(<MealsScreen />);

      await waitFor(() => {
        expect(getByText('Jan')).toBeTruthy();
      });
    });
  });
});
