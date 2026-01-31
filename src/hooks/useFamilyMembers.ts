import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'
import type { FamilyMember } from '../types'

const STORAGE_KEY = 'my-meals-family'

export function useFamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load members from AsyncStorage on mount
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          const loadedMembers = Array.isArray(data.members) ? data.members : []
          // Validate member objects have required fields
          const validMembers = loadedMembers.filter((member: unknown): member is FamilyMember =>
            member !== null &&
            typeof member === 'object' &&
            typeof (member as FamilyMember).id === 'string' &&
            typeof (member as FamilyMember).name === 'string'
          )
          setMembers(validMembers)
        }
      } catch (error) {
        console.error('Failed to load family members:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadMembers()
  }, [])

  // Save members to AsyncStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ members })).catch(error => {
        console.error('Failed to save family members:', error)
      })
    }
  }, [members, isLoading])

  const addMember = useCallback((name: string, avatar?: string) => {
    if (!name || typeof name !== 'string') {
      return null
    }

    const trimmedName = name.trim()
    if (!trimmedName) {
      return null
    }

    const now = new Date().toISOString()

    const newMember: FamilyMember = {
      id: uuidv4(),
      name: trimmedName,
      avatar,
      createdAt: now,
    }

    setMembers(prev => [...prev, newMember])
    return newMember
  }, [])

  const updateMember = useCallback((id: string, updates: Partial<Omit<FamilyMember, 'id' | 'createdAt'>>) => {
    setMembers(prev => prev.map(member =>
      member.id === id
        ? { ...member, ...updates, name: updates.name?.trim() || member.name }
        : member
    ))
  }, [])

  const deleteMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(member => member.id !== id))
  }, [])

  const getMemberById = useCallback((id: string) => {
    return members.find(member => member.id === id)
  }, [members])

  return {
    members,
    isLoading,
    addMember,
    updateMember,
    deleteMember,
    getMemberById,
  }
}
