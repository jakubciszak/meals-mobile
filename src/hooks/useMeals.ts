import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'
import type { Meal, MealRating } from '../types'

const STORAGE_KEY = 'my-meals-data'

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load meals from AsyncStorage on mount
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          const loadedMeals = Array.isArray(data.meals) ? data.meals : []
          // Validate meal objects have required fields
          const validMeals = loadedMeals.filter((meal: unknown): meal is Meal =>
            meal !== null &&
            typeof meal === 'object' &&
            typeof (meal as Meal).id === 'string' &&
            typeof (meal as Meal).name === 'string' &&
            typeof (meal as Meal).date === 'string'
          )
          setMeals(validMeals)
        }
      } catch (error) {
        console.error('Failed to load meals:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadMeals()
  }, [])

  // Save meals to AsyncStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ meals })).catch(error => {
        console.error('Failed to save meals:', error)
      })
    }
  }, [meals, isLoading])

  const addMeal = useCallback((name: string, date?: string, ingredients?: string[]) => {
    if (!name || typeof name !== 'string') {
      return null
    }

    const trimmedName = name.trim()
    if (!trimmedName) {
      return null
    }

    const now = new Date().toISOString()
    const mealDate = date && typeof date === 'string' ? date : now.split('T')[0]

    const newMeal: Meal = {
      id: uuidv4(),
      name: trimmedName,
      date: mealDate,
      ratings: [],
      ingredients: ingredients && ingredients.length > 0 ? ingredients : undefined,
      createdAt: now,
      updatedAt: now,
    }

    setMeals(prev => [newMeal, ...prev])
    return newMeal
  }, [])

  const deleteMeal = useCallback((id: string) => {
    setMeals(prev => prev.filter(meal => meal.id !== id))
  }, [])

  const getMealsByDate = useCallback((date: string) => {
    return meals.filter(meal => meal.date === date)
  }, [meals])

  const getTodaysMeals = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    return getMealsByDate(today)
  }, [getMealsByDate])

  const getMealsGroupedByDate = useCallback(() => {
    const grouped: Record<string, Meal[]> = {}

    meals.forEach(meal => {
      if (!grouped[meal.date]) {
        grouped[meal.date] = []
      }
      grouped[meal.date].push(meal)
    })

    // Sort dates in descending order
    const sortedDates = Object.keys(grouped).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    )

    return sortedDates.map(date => ({
      date,
      meals: grouped[date],
    }))
  }, [meals])

  const updateMealRating = useCallback((mealId: string, memberId: string, liked: boolean | null) => {
    setMeals(prev => prev.map(meal => {
      if (meal.id !== mealId) return meal

      const now = new Date().toISOString()
      let newRatings: MealRating[]

      if (liked === null) {
        // Remove rating
        newRatings = meal.ratings.filter(r => r.memberId !== memberId)
      } else {
        const existingRatingIndex = meal.ratings.findIndex(r => r.memberId === memberId)
        if (existingRatingIndex >= 0) {
          // Update existing rating
          newRatings = [...meal.ratings]
          newRatings[existingRatingIndex] = { memberId, liked }
        } else {
          // Add new rating
          newRatings = [...meal.ratings, { memberId, liked }]
        }
      }

      return {
        ...meal,
        ratings: newRatings,
        updatedAt: now,
      }
    }))
  }, [])

  const getMealById = useCallback((id: string) => {
    return meals.find(meal => meal.id === id)
  }, [meals])

  return {
    meals,
    isLoading,
    addMeal,
    deleteMeal,
    getMealsByDate,
    getTodaysMeals,
    getMealsGroupedByDate,
    updateMealRating,
    getMealById,
  }
}
