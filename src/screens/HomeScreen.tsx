import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { useMeals } from '../hooks/useMeals'
import { useFamilyMembers } from '../hooks/useFamilyMembers'
import type { Meal, FamilyMember } from '../types'

interface MealRatingButtonsProps {
  meal: Meal
  member: FamilyMember
  onRate: (mealId: string, memberId: string, liked: boolean | null) => void
}

function MealRatingButtons({ meal, member, onRate }: MealRatingButtonsProps) {
  const existingRating = meal.ratings.find(r => r.memberId === member.id)

  const handleLike = () => {
    if (existingRating?.liked === true) {
      onRate(meal.id, member.id, null)
    } else {
      onRate(meal.id, member.id, true)
    }
  }

  const handleDislike = () => {
    if (existingRating?.liked === false) {
      onRate(meal.id, member.id, null)
    } else {
      onRate(meal.id, member.id, false)
    }
  }

  return (
    <View style={styles.ratingRow}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {member.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.memberName}>{member.name}</Text>
      <View style={styles.ratingButtons}>
        <TouchableOpacity
          onPress={handleLike}
          style={[
            styles.ratingButton,
            existingRating?.liked === true && styles.ratingButtonLiked,
          ]}
        >
          <Ionicons
            name="thumbs-up"
            size={16}
            color={existingRating?.liked === true ? '#fff' : '#9ca3af'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDislike}
          style={[
            styles.ratingButton,
            existingRating?.liked === false && styles.ratingButtonDisliked,
          ]}
        >
          <Ionicons
            name="thumbs-down"
            size={16}
            color={existingRating?.liked === false ? '#fff' : '#9ca3af'}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function HomeScreen() {
  const [mealInput, setMealInput] = useState('')
  const [ingredientsInput, setIngredientsInput] = useState('')
  const [showIngredients, setShowIngredients] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [filterMemberId, setFilterMemberId] = useState<string>('')
  const [filterIngredient, setFilterIngredient] = useState<string>('')
  const { meals, addMeal, getMealsByDate, deleteMeal, updateMealRating, isLoading } = useMeals()
  const { members, isLoading: membersLoading } = useFamilyMembers()

  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === todayStr

  // Collect all unique ingredients for filter dropdown
  const allIngredients = useMemo(() => {
    return [...new Set(
      meals.flatMap(meal => meal.ingredients || []).filter(i => i.length > 0)
    )].sort()
  }, [meals])

  // Get meals for selected date with filters applied
  const selectedMeals = useMemo(() => {
    return getMealsByDate(selectedDate).filter(meal => {
      // Filter by member who liked
      if (filterMemberId) {
        const hasLikedRating = meal.ratings.some(
          r => r.memberId === filterMemberId && r.liked === true
        )
        if (!hasLikedRating) return false
      }
      // Filter by ingredient
      if (filterIngredient) {
        const hasIngredient = meal.ingredients?.some(
          i => i.toLowerCase().includes(filterIngredient.toLowerCase())
        )
        if (!hasIngredient) return false
      }
      return true
    })
  }, [getMealsByDate, selectedDate, filterMemberId, filterIngredient])

  const goToPreviousDay = () => {
    const date = new Date(selectedDate + 'T12:00:00')
    date.setDate(date.getDate() - 1)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const date = new Date(selectedDate + 'T12:00:00')
    date.setDate(date.getDate() + 1)
    const nextDate = date.toISOString().split('T')[0]
    // Don't go past today
    if (nextDate <= todayStr) {
      setSelectedDate(nextDate)
    }
  }

  const clearFilters = () => {
    setFilterMemberId('')
    setFilterIngredient('')
  }

  const hasActiveFilters = filterMemberId || filterIngredient

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Dzisiaj'
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Wczoraj'
    } else {
      return date.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    }
  }

  const today = new Date().toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const handleAddMeal = () => {
    if (!mealInput.trim()) return
    const ingredients = ingredientsInput
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0)
    addMeal(mealInput, selectedDate, ingredients.length > 0 ? ingredients : undefined)
    setMealInput('')
    setIngredientsInput('')
    setShowIngredients(false)
  }

  const handleDeleteMeal = (id: string, name: string) => {
    Alert.alert(
      'Usuń posiłek',
      `Czy na pewno chcesz usunąć "${name}"?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        { text: 'Usuń', style: 'destructive', onPress: () => deleteMeal(id) },
      ]
    )
  }

  const handleRate = (mealId: string, memberId: string, liked: boolean | null) => {
    updateMealRating(mealId, memberId, liked)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dzisiejsze obiady</Text>
        <Text style={styles.subtitle}>{today}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dodaj obiad</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={mealInput}
            onChangeText={setMealInput}
            placeholder="Co było na obiad?"
            placeholderTextColor="#9ca3af"
            onSubmitEditing={handleAddMeal}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddMeal}
          >
            <Text style={styles.addButtonText}>Dodaj</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.ingredientsToggle}
          onPress={() => setShowIngredients(!showIngredients)}
        >
          <Ionicons
            name={showIngredients ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#6b7280"
          />
          <Text style={styles.ingredientsToggleText}>
            Dodaj składniki (opcjonalnie)
          </Text>
        </TouchableOpacity>
        {showIngredients && (
          <TextInput
            style={[styles.input, styles.ingredientsInput]}
            value={ingredientsInput}
            onChangeText={setIngredientsInput}
            placeholder="np. kurczak, ryż, warzywa"
            placeholderTextColor="#9ca3af"
          />
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.dateNavigation}>
          <TouchableOpacity
            onPress={goToPreviousDay}
            style={styles.navButton}
            accessibilityLabel="Poprzedni dzień"
          >
            <Ionicons name="chevron-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>
            {formatDateHeader(selectedDate)}
          </Text>
          <TouchableOpacity
            onPress={goToNextDay}
            style={[styles.navButton, isToday && styles.navButtonDisabled]}
            disabled={isToday}
            accessibilityLabel="Następny dzień"
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isToday ? '#d1d5db' : '#3b82f6'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={filterMemberId}
                onValueChange={(value) => setFilterMemberId(value)}
                style={styles.picker}
              >
                <Picker.Item label="Wszystkie osoby" value="" />
                {members.map(member => (
                  <Picker.Item
                    key={member.id}
                    label={`Polubione przez: ${member.name}`}
                    value={member.id}
                  />
                ))}
              </Picker>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={filterIngredient}
                onValueChange={(value) => setFilterIngredient(value)}
                style={styles.picker}
              >
                <Picker.Item label="Wszystkie składniki" value="" />
                {allIngredients.map(ingredient => (
                  <Picker.Item
                    key={ingredient}
                    label={ingredient}
                    value={ingredient}
                  />
                ))}
              </Picker>
            </View>
          </View>
          {hasActiveFilters && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
              <Ionicons name="close-circle" size={16} color="#6b7280" />
              <Text style={styles.clearFiltersText}>Wyczyść filtry</Text>
            </TouchableOpacity>
          )}
        </View>
        {isLoading || membersLoading ? (
          <Text style={styles.emptyText}>Ładowanie...</Text>
        ) : selectedMeals.length === 0 ? (
          <Text style={styles.emptyText}>
            Brak obiadów na {isToday ? 'dziś' : 'ten dzień'}. Dodaj pierwszy!
          </Text>
        ) : (
          selectedMeals.map((meal) => (
            <View key={meal.id} style={styles.card}>
              <View style={styles.mealHeader}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>
                    {new Date(meal.createdAt).toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <View style={styles.ingredientsList}>
                      {meal.ingredients.map((ingredient, idx) => (
                        <View key={idx} style={styles.ingredientTag}>
                          <Text style={styles.ingredientTagText}>{ingredient}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteMeal(meal.id, meal.name)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              {members.length > 0 && (
                <View style={styles.ratingsSection}>
                  <Text style={styles.ratingsLabel}>Oceny:</Text>
                  {members.map((member) => (
                    <MealRatingButtons
                      key={member.id}
                      meal={meal}
                      member={member}
                      onRate={handleRate}
                    />
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
    color: '#111827',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 32,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  mealTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  ratingsSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  ratingsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  memberName: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    minWidth: 60,
  },
  ratingButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
    gap: 4,
  },
  ratingButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  ratingButtonLiked: {
    backgroundColor: '#22c55e',
  },
  ratingButtonDisliked: {
    backgroundColor: '#ef4444',
  },
  ingredientsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  ingredientsToggleText: {
    fontSize: 14,
    color: '#6b7280',
  },
  ingredientsInput: {
    marginTop: 8,
    flex: 0,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    marginTop: Platform.OS === 'ios' ? -8 : 0,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#6b7280',
  },
  mealInfo: {
    flex: 1,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  ingredientTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ingredientTagText: {
    fontSize: 12,
    color: '#4b5563',
  },
})
