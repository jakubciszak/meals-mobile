import React, { useState } from 'react'
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
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const { addMeal, getMealsByDate, deleteMeal, updateMealRating, isLoading } = useMeals()
  const { members, isLoading: membersLoading } = useFamilyMembers()

  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === todayStr
  const selectedMeals = getMealsByDate(selectedDate)

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
    addMeal(mealInput, selectedDate)
    setMealInput('')
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
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Posiłki: {formatDateHeader(selectedDate)}
        </Text>
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
                <View>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>
                    {new Date(meal.createdAt).toLocaleTimeString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
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
})
