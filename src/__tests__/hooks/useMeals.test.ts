import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useMeals } from '../../hooks/useMeals';
import type { FamilyMember } from '../../types';

jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: {
    UTF8: 'utf8',
  },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Custom waitFor implementation for hooks
const waitFor = async (callback: () => void, options = { timeout: 1000, interval: 50 }) => {
  const startTime = Date.now();
  while (Date.now() - startTime < options.timeout) {
    try {
      callback();
      return;
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, options.interval));
    }
  }
  callback(); // Final attempt, throw if fails
};

describe('useMeals', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with empty meals array', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.meals).toEqual([]);
    });

    it('should load meals from storage on mount', async () => {
      const storedMeals = {
        meals: [
          {
            id: 'existing-meal',
            name: 'Stored Meal',
            date: '2024-01-15',
            ratings: [],
            createdAt: '2024-01-15T12:00:00.000Z',
            updatedAt: '2024-01-15T12:00:00.000Z',
          },
        ],
      };
      await AsyncStorage.setItem('my-meals-data', JSON.stringify(storedMeals));

      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.meals).toHaveLength(1);
      expect(result.current.meals[0].name).toBe('Stored Meal');
    });

    it('should handle corrupted storage data gracefully', async () => {
      await AsyncStorage.setItem('my-meals-data', 'invalid-json');

      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.meals).toEqual([]);
    });
  });

  describe('addMeal', () => {
    it('should add a new meal with default date', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Spaghetti');
      });

      expect(result.current.meals).toHaveLength(1);
      expect(result.current.meals[0].name).toBe('Spaghetti');
      expect(result.current.meals[0].ratings).toEqual([]);
    });

    it('should add a meal with specified date', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Pizza', '2024-01-20');
      });

      expect(result.current.meals[0].date).toBe('2024-01-20');
    });

    it('should add a meal with ingredients', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Salad', undefined, ['lettuce', 'tomato', 'cucumber']);
      });

      expect(result.current.meals[0].ingredients).toEqual(['lettuce', 'tomato', 'cucumber']);
    });

    it('should trim whitespace from meal name', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('  Trimmed Meal  ');
      });

      expect(result.current.meals[0].name).toBe('Trimmed Meal');
    });

    it('should add new meals at the beginning of the array', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('First');
      });
      act(() => {
        result.current.addMeal('Second');
      });

      expect(result.current.meals[0].name).toBe('Second');
      expect(result.current.meals[1].name).toBe('First');
    });

    it('should return the created meal', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newMeal: ReturnType<typeof result.current.addMeal>;
      act(() => {
        newMeal = result.current.addMeal('Return Test');
      });

      expect(newMeal!.name).toBe('Return Test');
      expect(newMeal!.id).toBeDefined();
    });
  });

  describe('deleteMeal', () => {
    it('should delete a meal by id', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('To Delete');
      });

      const mealId = result.current.meals[0].id;

      act(() => {
        result.current.deleteMeal(mealId);
      });

      expect(result.current.meals).toHaveLength(0);
    });

    it('should not affect other meals when deleting', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Keep 1');
        result.current.addMeal('Delete Me');
        result.current.addMeal('Keep 2');
      });

      const mealToDelete = result.current.meals.find(m => m.name === 'Delete Me');

      act(() => {
        result.current.deleteMeal(mealToDelete!.id);
      });

      expect(result.current.meals).toHaveLength(2);
      expect(result.current.meals.find(m => m.name === 'Keep 1')).toBeDefined();
      expect(result.current.meals.find(m => m.name === 'Keep 2')).toBeDefined();
    });
  });

  describe('getMealsByDate', () => {
    it('should return meals for a specific date', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Meal 1', '2024-01-15');
        result.current.addMeal('Meal 2', '2024-01-15');
        result.current.addMeal('Meal 3', '2024-01-16');
      });

      const meals = result.current.getMealsByDate('2024-01-15');

      expect(meals).toHaveLength(2);
      expect(meals.every(m => m.date === '2024-01-15')).toBe(true);
    });

    it('should return empty array for date with no meals', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const meals = result.current.getMealsByDate('2024-01-01');

      expect(meals).toEqual([]);
    });
  });

  describe('getTodaysMeals', () => {
    it('should return only meals from today', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      act(() => {
        result.current.addMeal('Today Meal', today);
        result.current.addMeal('Yesterday Meal', yesterday);
      });

      const todaysMeals = result.current.getTodaysMeals();

      expect(todaysMeals).toHaveLength(1);
      expect(todaysMeals[0].name).toBe('Today Meal');
    });
  });

  describe('getMealsGroupedByDate', () => {
    it('should group meals by date in descending order', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Meal A', '2024-01-14');
        result.current.addMeal('Meal B', '2024-01-16');
        result.current.addMeal('Meal C', '2024-01-15');
      });

      const grouped = result.current.getMealsGroupedByDate();

      expect(grouped).toHaveLength(3);
      expect(grouped[0].date).toBe('2024-01-16');
      expect(grouped[1].date).toBe('2024-01-15');
      expect(grouped[2].date).toBe('2024-01-14');
    });

    it('should include all meals for each date', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Meal 1', '2024-01-15');
        result.current.addMeal('Meal 2', '2024-01-15');
      });

      const grouped = result.current.getMealsGroupedByDate();

      expect(grouped).toHaveLength(1);
      expect(grouped[0].meals).toHaveLength(2);
    });
  });

  describe('updateMealRating', () => {
    it('should add a new rating', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Rated Meal');
      });

      const mealId = result.current.meals[0].id;

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', true);
      });

      expect(result.current.meals[0].ratings).toHaveLength(1);
      expect(result.current.meals[0].ratings[0]).toEqual({ memberId: 'member-1', liked: true });
    });

    it('should update an existing rating', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Rated Meal');
      });

      const mealId = result.current.meals[0].id;

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', true);
      });

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', false);
      });

      expect(result.current.meals[0].ratings).toHaveLength(1);
      expect(result.current.meals[0].ratings[0].liked).toBe(false);
    });

    it('should remove a rating when liked is null', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Rated Meal');
      });

      const mealId = result.current.meals[0].id;

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', true);
      });

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', null);
      });

      expect(result.current.meals[0].ratings).toHaveLength(0);
    });

    it('should handle ratings from multiple members', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Multi-rated Meal');
      });

      const mealId = result.current.meals[0].id;

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', true);
        result.current.updateMealRating(mealId, 'member-2', false);
      });

      expect(result.current.meals[0].ratings).toHaveLength(2);
    });

    it('should update the updatedAt timestamp', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Timestamp Meal');
      });

      const mealId = result.current.meals[0].id;
      const originalUpdatedAt = result.current.meals[0].updatedAt;

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', true);
      });

      expect(result.current.meals[0].updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('getMealById', () => {
    it('should return meal by id', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Find Me');
      });

      const mealId = result.current.meals[0].id;
      const meal = result.current.getMealById(mealId);

      expect(meal).toBeDefined();
      expect(meal!.name).toBe('Find Me');
    });

    it('should return undefined for non-existent id', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const meal = result.current.getMealById('non-existent');

      expect(meal).toBeUndefined();
    });
  });

  describe('persistence', () => {
    it('should persist meals to AsyncStorage', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Persisted Meal');
      });

      // Wait for persistence
      await waitFor(async () => {
        const stored = await AsyncStorage.getItem('my-meals-data');
        expect(stored).not.toBeNull();
      });

      const stored = await AsyncStorage.getItem('my-meals-data');
      const data = JSON.parse(stored!);

      expect(data.meals).toHaveLength(1);
      expect(data.meals[0].name).toBe('Persisted Meal');
    });
  });

  describe('exportToCSV', () => {
    const mockMembers: FamilyMember[] = [
      { id: 'member-1', name: 'Jan', createdAt: '2024-01-01T00:00:00.000Z' },
      { id: 'member-2', name: 'Anna', createdAt: '2024-01-01T00:00:00.000Z' },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return false when no meals exist', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let exportResult: boolean | undefined;
      await act(async () => {
        exportResult = await result.current.exportToCSV(mockMembers);
      });

      expect(exportResult).toBe(false);
      expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled();
    });

    it('should create CSV file with correct headers', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Test Meal', '2024-01-15', ['kurczak', 'ryż']);
      });

      await act(async () => {
        await result.current.exportToCSV(mockMembers);
      });

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0][1];
      expect(csvContent).toContain('Data,Godzina,Nazwa posilku,Skladniki,Polubili,Nie polubili');
    });

    it('should include meal data in CSV', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Spaghetti', '2024-01-15', ['makaron', 'sos']);
      });

      await act(async () => {
        await result.current.exportToCSV(mockMembers);
      });

      const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0][1];
      expect(csvContent).toContain('2024-01-15');
      expect(csvContent).toContain('Spaghetti');
      expect(csvContent).toContain('makaron, sos');
    });

    it('should include ratings in CSV', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Rated Meal', '2024-01-15');
      });

      const mealId = result.current.meals[0].id;

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', true);
        result.current.updateMealRating(mealId, 'member-2', false);
      });

      await act(async () => {
        await result.current.exportToCSV(mockMembers);
      });

      const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0][1];
      expect(csvContent).toContain('Jan');
      expect(csvContent).toContain('Anna');
    });

    it('should call sharing API', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Share Meal');
      });

      await act(async () => {
        await result.current.exportToCSV(mockMembers);
      });

      expect(Sharing.isAvailableAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    it('should return false when sharing is not available', async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);

      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('No Share Meal');
      });

      let exportResult: boolean | undefined;
      await act(async () => {
        exportResult = await result.current.exportToCSV(mockMembers);
      });

      expect(exportResult).toBe(false);
    });

    it('should escape CSV special characters', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Meal with "quotes" and, commas', '2024-01-15');
      });

      await act(async () => {
        await result.current.exportToCSV(mockMembers);
      });

      const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0][1];
      expect(csvContent).toContain('"Meal with ""quotes"" and, commas"');
    });

    it('should sort meals by date descending', async () => {
      const { result } = renderHook(() => useMeals());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMeal('Older', '2024-01-10');
        result.current.addMeal('Newer', '2024-01-20');
        result.current.addMeal('Middle', '2024-01-15');
      });

      await act(async () => {
        await result.current.exportToCSV(mockMembers);
      });

      const csvContent = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0][1];
      const lines = csvContent.split('\n');
      // Headers + 3 meals = 4 lines
      expect(lines.length).toBe(4);
      expect(lines[1]).toContain('2024-01-20');
      expect(lines[2]).toContain('2024-01-15');
      expect(lines[3]).toContain('2024-01-10');
    });
  });
});
