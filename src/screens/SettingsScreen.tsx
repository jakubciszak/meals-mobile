import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native'

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ustawienia</Text>
        <Text style={styles.subtitle}>Konfiguracja aplikacji</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Synchronizacja</Text>
          <Text style={styles.cardDescription}>
            Połącz z Google Drive, aby synchronizować dane między urządzeniami.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Połącz z Google Drive</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kalendarz Google</Text>
          <Text style={styles.cardDescription}>
            Synchronizuj obiady z kalendarzem Google.
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Połącz z Kalendarzem</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dane</Text>
          <Text style={styles.cardDescription}>
            Eksportuj lub wyczyść wszystkie dane aplikacji.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.buttonHalf]}>
              <Text style={styles.buttonText}>Eksportuj</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonDanger, styles.buttonHalf]}>
              <Text style={styles.buttonDangerText}>Wyczyść</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  },
  content: {
    paddingTop: 8,
    gap: 16,
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonDanger: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flex: 1,
  },
  buttonDangerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
})
