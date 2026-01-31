import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMeals } from '../hooks/useMeals'
import { useFamilyMembers } from '../hooks/useFamilyMembers'
import type { Meal, FamilyMember } from '../types'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dateOnly = dateString.split('T')[0]
  const todayOnly = today.toISOString().split('T')[0]
  const yesterdayOnly = yesterday.toISOString().split('T')[0]

  if (dateOnly === todayOnly) {
    return 'Dzisiaj'
  }
  if (dateOnly === yesterdayOnly) {
    return 'Wczoraj'
  }

  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface MealRatingSummaryProps {
  meal: Meal
  members: FamilyMember[]
}

function MealRatingSummary({ meal, members }: MealRatingSummaryProps) {
  if (members.length === 0 || meal.ratings.length === 0) {
    return null
  }

  const likes = meal.ratings.filter(r => r.liked)
  const dislikes = meal.ratings.filter(r => !r.liked)

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member?.name || 'Nieznany'
  }

  return (
    <View style={styles.ratingSummary}>
      {likes.length > 0 && (
        <View style={styles.ratingSummaryItem}>
          <Ionicons name="thumbs-up" size={14} color="#22c55e" />
          <Text style={styles.ratingSummaryText}>
            {likes.map(r => getMemberName(r.memberId)).join(', ')}
          </Text>
        </View>
      )}
      {dislikes.length > 0 && (
        <View style={styles.ratingSummaryItem}>
          <Ionicons name="thumbs-down" size={14} color="#ef4444" />
          <Text style={styles.ratingSummaryText}>
            {dislikes.map(r => getMemberName(r.memberId)).join(', ')}
          </Text>
        </View>
      )}
    </View>
  )
}

export default function MealsScreen() {
  const { getMealsGroupedByDate, deleteMeal, isLoading } = useMeals()
  const { members, isLoading: membersLoading } = useFamilyMembers()

  const groupedMeals = getMealsGroupedByDate()

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Historia obiadów</Text>
          <Text style={styles.subtitle}>Przeglądaj wcześniejsze posiłki</Text>
        </View>
      </View>

      <View style={styles.content}>
        {isLoading || membersLoading ? (
          <Text style={styles.emptyText}>Ładowanie...</Text>
        ) : groupedMeals.length === 0 ? (
          <Text style={styles.emptyText}>Brak zapisanych obiadów.</Text>
        ) : (
          groupedMeals.map(({ date, meals }) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>
              {meals.map((meal) => (
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
                        <Text style={styles.ingredients}>
                          Składniki: {meal.ingredients.join(', ')}
                        </Text>
                      )}
                      <MealRatingSummary meal={meal} members={members} />
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteMeal(meal.id, meal.name)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    paddingTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 32,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
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
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mealInfo: {
    flex: 1,
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
  ingredients: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  ratingSummary: {
    marginTop: 8,
    gap: 4,
  },
  ratingSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingSummaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
})
