import { renderHook, act } from '@testing-library/react'
import { useFamilyMembers } from '../hooks/useFamilyMembers'

describe('useFamilyMembers', () => {

  describe('addMember', () => {
    it('should add a member with valid name', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('Jan Kowalski')
      })

      expect(result.current.members).toHaveLength(1)
      expect(result.current.members[0].name).toBe('Jan Kowalski')
    })

    it('should trim whitespace from member name', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('  Anna Nowak  ')
      })

      expect(result.current.members[0].name).toBe('Anna Nowak')
    })

    it('should return null for empty name', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let returnValue: unknown
      act(() => {
        returnValue = result.current.addMember('')
      })

      expect(returnValue).toBeNull()
      expect(result.current.members).toHaveLength(0)
    })

    it('should return null for whitespace-only name', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let returnValue: unknown
      act(() => {
        returnValue = result.current.addMember('   ')
      })

      expect(returnValue).toBeNull()
      expect(result.current.members).toHaveLength(0)
    })

    it('should return null for undefined/null name', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      let returnValue: unknown
      act(() => {
        // @ts-expect-error - testing invalid input
        returnValue = result.current.addMember(undefined)
      })

      expect(returnValue).toBeNull()
      expect(result.current.members).toHaveLength(0)

      act(() => {
        // @ts-expect-error - testing invalid input
        returnValue = result.current.addMember(null)
      })

      expect(returnValue).toBeNull()
      expect(result.current.members).toHaveLength(0)
    })

    it('should add avatar when provided', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('Jan', 'avatar-url')
      })

      expect(result.current.members[0].avatar).toBe('avatar-url')
    })

    it('should generate unique IDs for each member', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('Member 1')
        result.current.addMember('Member 2')
        result.current.addMember('Member 3')
      })

      const ids = result.current.members.map(m => m.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(3)
    })

    it('should set createdAt timestamp', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const beforeAdd = new Date().toISOString()

      act(() => {
        result.current.addMember('Test Member')
      })

      const afterAdd = new Date().toISOString()

      expect(result.current.members[0].createdAt).toBeDefined()
      expect(result.current.members[0].createdAt >= beforeAdd).toBe(true)
      expect(result.current.members[0].createdAt <= afterAdd).toBe(true)
    })
  })

  describe('updateMember', () => {
    it('should update member name', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('Original Name')
      })

      const memberId = result.current.members[0].id

      act(() => {
        result.current.updateMember(memberId, { name: 'Updated Name' })
      })

      expect(result.current.members[0].name).toBe('Updated Name')
    })

    it('should trim whitespace when updating name', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('Original')
      })

      const memberId = result.current.members[0].id

      act(() => {
        result.current.updateMember(memberId, { name: '  Trimmed Name  ' })
      })

      expect(result.current.members[0].name).toBe('Trimmed Name')
    })

    it('should update avatar', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('Test', 'old-avatar')
      })

      const memberId = result.current.members[0].id

      act(() => {
        result.current.updateMember(memberId, { avatar: 'new-avatar' })
      })

      expect(result.current.members[0].avatar).toBe('new-avatar')
    })

    it('should not affect other members', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('Member 1')
        result.current.addMember('Member 2')
      })

      const firstMemberId = result.current.members[0].id

      act(() => {
        result.current.updateMember(firstMemberId, { name: 'Updated Member 1' })
      })

      expect(result.current.members[1].name).toBe('Member 2')
    })
  })

  describe('deleteMember', () => {
    it('should delete a member by id', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('Member to delete')
      })

      const memberId = result.current.members[0].id

      act(() => {
        result.current.deleteMember(memberId)
      })

      expect(result.current.members).toHaveLength(0)
    })

    it('should not affect other members when deleting', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('Member 1')
        result.current.addMember('Member 2')
        result.current.addMember('Member 3')
      })

      const memberToDelete = result.current.members[1]

      act(() => {
        result.current.deleteMember(memberToDelete.id)
      })

      expect(result.current.members).toHaveLength(2)
      expect(result.current.members.find(m => m.id === memberToDelete.id)).toBeUndefined()
    })

    it('should handle deletion of non-existent id gracefully', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('Member 1')
      })

      act(() => {
        result.current.deleteMember('non-existent-id')
      })

      expect(result.current.members).toHaveLength(1)
    })
  })

  describe('getMemberById', () => {
    it('should return member by id', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      act(() => {
        result.current.addMember('Test Member')
      })

      const memberId = result.current.members[0].id
      const member = result.current.getMemberById(memberId)

      expect(member).toBeDefined()
      expect(member?.name).toBe('Test Member')
    })

    it('should return undefined for non-existent id', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      const member = result.current.getMemberById('non-existent-id')

      expect(member).toBeUndefined()
    })
  })

  describe('persistence', () => {
    it('should load members from AsyncStorage on mount', async () => {
      const storedData = {
        members: [
          {
            id: 'test-id-1',
            name: 'Stored Member',
            createdAt: '2024-01-15T12:00:00.000Z',
          },
        ],
      }

      // Set data in mock storage before hook mount
      global.__mockAsyncStorage.set('my-meals-family', JSON.stringify(storedData))

      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.members).toHaveLength(1)
      expect(result.current.members[0].name).toBe('Stored Member')
    })

    it('should filter out invalid members from storage', async () => {
      const storedData = {
        members: [
          { id: 'valid', name: 'Valid Member', createdAt: '' },
          { id: 'invalid-no-name' }, // missing name
          { name: 'Invalid no id' }, // missing id
          null,
          'not an object',
        ],
      }

      // Set data in mock storage before hook mount
      global.__mockAsyncStorage.set('my-meals-family', JSON.stringify(storedData))

      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.members).toHaveLength(1)
      expect(result.current.members[0].name).toBe('Valid Member')
    })

    it('should handle corrupted JSON gracefully', async () => {
      // Set corrupted data in mock storage
      global.__mockAsyncStorage.set('my-meals-family', 'not valid json')

      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.members).toHaveLength(0)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('loading state', () => {
    it('should start with isLoading true', () => {
      const { result } = renderHook(() => useFamilyMembers())

      expect(result.current.isLoading).toBe(true)
    })

    it('should set isLoading to false after loading', async () => {
      const { result } = renderHook(() => useFamilyMembers())

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current.isLoading).toBe(false)
    })
  })
})
