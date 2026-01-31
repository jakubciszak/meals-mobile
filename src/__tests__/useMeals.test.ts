import { renderHook, act } from '@testing-library/react'
import { useMeals } from '../hooks/useMeals'

describe('useMeals', () => {

  describe('addMeal', () => {
    it('should add a meal with valid name', async () => {
      const { result } = renderHook(() => useMeals())

      // Wait for initial loading
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('Spaghetti Bolognese')
      })

      expect(result.current.meals).toHaveLength(1)
      expect(result.current.meals[0].name).toBe('Spaghetti Bolognese')
    })

    it('should trim whitespace from meal name', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('  Pizza Margherita  ')
      })

      expect(result.current.meals[0].name).toBe('Pizza Margherita')
    })

    it('should return null for empty name', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let returnValue: unknown
      act(() => {
        returnValue = result.current.addMeal('')
      })

      expect(returnValue).toBeNull()
      expect(result.current.meals).toHaveLength(0)
    })

    it('should return null for whitespace-only name', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let returnValue: unknown
      act(() => {
        returnValue = result.current.addMeal('   ')
      })

      expect(returnValue).toBeNull()
      expect(result.current.meals).toHaveLength(0)
    })

    it('should return null for undefined/null name', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let returnValue: unknown
      act(() => {
        // @ts-expect-error - testing invalid input
        returnValue = result.current.addMeal(undefined)
      })

      expect(returnValue).toBeNull()
      expect(result.current.meals).toHaveLength(0)

      act(() => {
        // @ts-expect-error - testing invalid input
        returnValue = result.current.addMeal(null)
      })

      expect(returnValue).toBeNull()
      expect(result.current.meals).toHaveLength(0)
    })

    it('should use provided date', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('Soup', '2024-01-15')
      })

      expect(result.current.meals[0].date).toBe('2024-01-15')
    })

    it('should use current date if no date provided', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const today = new Date().toISOString().split('T')[0]

      act(() => {
        result.current.addMeal('Salad')
      })

      expect(result.current.meals[0].date).toBe(today)
    })

    it('should add ingredients when provided', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const ingredients = ['pasta', 'tomato sauce', 'cheese']

      act(() => {
        result.current.addMeal('Pasta', undefined, ingredients)
      })

      expect(result.current.meals[0].ingredients).toEqual(ingredients)
    })

    it('should generate unique IDs for each meal', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('Meal 1')
        result.current.addMeal('Meal 2')
        result.current.addMeal('Meal 3')
      })

      const ids = result.current.meals.map(m => m.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(3)
    })
  })

  describe('deleteMeal', () => {
    it('should delete a meal by id', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('Meal to delete')
      })

      const mealId = result.current.meals[0].id

      act(() => {
        result.current.deleteMeal(mealId)
      })

      expect(result.current.meals).toHaveLength(0)
    })

    it('should not affect other meals when deleting', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('Meal 1')
        result.current.addMeal('Meal 2')
        result.current.addMeal('Meal 3')
      })

      const mealToDelete = result.current.meals[1]

      act(() => {
        result.current.deleteMeal(mealToDelete.id)
      })

      expect(result.current.meals).toHaveLength(2)
      expect(result.current.meals.find(m => m.id === mealToDelete.id)).toBeUndefined()
    })
  })

  describe('getMealsByDate', () => {
    it('should return meals for specific date', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('Breakfast', '2024-01-15')
        result.current.addMeal('Lunch', '2024-01-15')
        result.current.addMeal('Dinner', '2024-01-16')
      })

      const mealsOn15th = result.current.getMealsByDate('2024-01-15')

      expect(mealsOn15th).toHaveLength(2)
      expect(mealsOn15th.every(m => m.date === '2024-01-15')).toBe(true)
    })

    it('should return empty array for date with no meals', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('Meal', '2024-01-15')
      })

      const meals = result.current.getMealsByDate('2024-01-20')

      expect(meals).toHaveLength(0)
    })
  })

  describe('updateMealRating', () => {
    it('should add a rating to a meal', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('Test Meal')
      })

      const mealId = result.current.meals[0].id

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', true)
      })

      expect(result.current.meals[0].ratings).toHaveLength(1)
      expect(result.current.meals[0].ratings[0]).toEqual({
        memberId: 'member-1',
        liked: true,
      })
    })

    it('should update existing rating', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('Test Meal')
      })

      const mealId = result.current.meals[0].id

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', true)
      })

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', false)
      })

      expect(result.current.meals[0].ratings).toHaveLength(1)
      expect(result.current.meals[0].ratings[0].liked).toBe(false)
    })

    it('should remove rating when liked is null', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('Test Meal')
      })

      const mealId = result.current.meals[0].id

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', true)
      })

      act(() => {
        result.current.updateMealRating(mealId, 'member-1', null)
      })

      expect(result.current.meals[0].ratings).toHaveLength(0)
    })
  })

  describe('getMealsGroupedByDate', () => {
    it('should group meals by date', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMeal('Meal 1', '2024-01-15')
        result.current.addMeal('Meal 2', '2024-01-15')
        result.current.addMeal('Meal 3', '2024-01-16')
      })

      const grouped = result.current.getMealsGroupedByDate()

      expect(grouped).toHaveLength(2)
      expect(grouped[0].date).toBe('2024-01-16') // More recent first
      expect(grouped[0].meals).toHaveLength(1)
      expect(grouped[1].date).toBe('2024-01-15')
      expect(grouped[1].meals).toHaveLength(2)
    })

    it('should return empty array when no meals', async () => {
      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const grouped = result.current.getMealsGroupedByDate()

      expect(grouped).toHaveLength(0)
    })
  })

  describe('persistence', () => {
    it('should load meals from AsyncStorage on mount', async () => {
      const storedMeals = {
        meals: [
          {
            id: 'test-id-1',
            name: 'Stored Meal',
            date: '2024-01-15',
            ratings: [],
            createdAt: '2024-01-15T12:00:00.000Z',
            updatedAt: '2024-01-15T12:00:00.000Z',
          },
        ],
      }

      // Set data in mock storage before hook mount
      global.__mockAsyncStorage.set('my-meals-data', JSON.stringify(storedMeals))

      const { result } = renderHook(() => useMeals())

      // Wait for loading
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.meals).toHaveLength(1)
      expect(result.current.meals[0].name).toBe('Stored Meal')
    })

    it('should filter out invalid meals from storage', async () => {
      const storedData = {
        meals: [
          { id: 'valid', name: 'Valid Meal', date: '2024-01-15', ratings: [], createdAt: '', updatedAt: '' },
          { id: 'invalid-no-name', date: '2024-01-15' }, // missing name
          { name: 'Invalid no id', date: '2024-01-15' }, // missing id
          null,
          'not an object',
        ],
      }

      // Set data in mock storage before hook mount
      global.__mockAsyncStorage.set('my-meals-data', JSON.stringify(storedData))

      const { result } = renderHook(() => useMeals())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.meals).toHaveLength(1)
      expect(result.current.meals[0].name).toBe('Valid Meal')
    })
  })
})
