import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFamilyMembers } from '../../hooks/useFamilyMembers';

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

describe('useFamilyMembers', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should start with empty members array', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.members).toEqual([]);
    });

    it('should load members from storage on mount', async () => {
      const storedMembers = {
        members: [
          {
            id: 'existing-member',
            name: 'Jan',
            createdAt: '2024-01-15T12:00:00.000Z',
          },
        ],
      };
      await AsyncStorage.setItem('my-meals-family', JSON.stringify(storedMembers));

      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.members).toHaveLength(1);
      expect(result.current.members[0].name).toBe('Jan');
    });

    it('should handle corrupted storage data gracefully', async () => {
      await AsyncStorage.setItem('my-meals-family', 'invalid-json');

      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.members).toEqual([]);
    });

    it('should handle empty storage object', async () => {
      await AsyncStorage.setItem('my-meals-family', JSON.stringify({}));

      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.members).toEqual([]);
    });
  });

  describe('addMember', () => {
    it('should add a new member', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Anna');
      });

      expect(result.current.members).toHaveLength(1);
      expect(result.current.members[0].name).toBe('Anna');
    });

    it('should add a member with avatar', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Marek', 'avatar-url');
      });

      expect(result.current.members[0].avatar).toBe('avatar-url');
    });

    it('should trim whitespace from member name', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('  Ewa  ');
      });

      expect(result.current.members[0].name).toBe('Ewa');
    });

    it('should add new members at the end of the array', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('First');
      });
      act(() => {
        result.current.addMember('Second');
      });

      expect(result.current.members[0].name).toBe('First');
      expect(result.current.members[1].name).toBe('Second');
    });

    it('should return the created member', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let newMember: ReturnType<typeof result.current.addMember>;
      act(() => {
        newMember = result.current.addMember('Return Test');
      });

      expect(newMember!.name).toBe('Return Test');
      expect(newMember!.id).toBeDefined();
      expect(newMember!.createdAt).toBeDefined();
    });

    it('should generate unique IDs for each member', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Member 1');
        result.current.addMember('Member 2');
      });

      expect(result.current.members[0].id).not.toBe(result.current.members[1].id);
    });
  });

  describe('updateMember', () => {
    it('should update member name', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Old Name');
      });

      const memberId = result.current.members[0].id;

      act(() => {
        result.current.updateMember(memberId, { name: 'New Name' });
      });

      expect(result.current.members[0].name).toBe('New Name');
    });

    it('should update member avatar', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Test');
      });

      const memberId = result.current.members[0].id;

      act(() => {
        result.current.updateMember(memberId, { avatar: 'new-avatar' });
      });

      expect(result.current.members[0].avatar).toBe('new-avatar');
    });

    it('should trim whitespace when updating name', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Original');
      });

      const memberId = result.current.members[0].id;

      act(() => {
        result.current.updateMember(memberId, { name: '  Trimmed  ' });
      });

      expect(result.current.members[0].name).toBe('Trimmed');
    });

    it('should keep original name if update name is empty', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Keep Me');
      });

      const memberId = result.current.members[0].id;

      act(() => {
        result.current.updateMember(memberId, { name: '' });
      });

      expect(result.current.members[0].name).toBe('Keep Me');
    });

    it('should not affect other members when updating', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Member 1');
        result.current.addMember('Member 2');
      });

      const memberId = result.current.members[0].id;

      act(() => {
        result.current.updateMember(memberId, { name: 'Updated' });
      });

      expect(result.current.members[1].name).toBe('Member 2');
    });

    it('should preserve createdAt when updating', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Test');
      });

      const memberId = result.current.members[0].id;
      const originalCreatedAt = result.current.members[0].createdAt;

      act(() => {
        result.current.updateMember(memberId, { name: 'Updated' });
      });

      expect(result.current.members[0].createdAt).toBe(originalCreatedAt);
    });
  });

  describe('deleteMember', () => {
    it('should delete a member by id', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('To Delete');
      });

      const memberId = result.current.members[0].id;

      act(() => {
        result.current.deleteMember(memberId);
      });

      expect(result.current.members).toHaveLength(0);
    });

    it('should not affect other members when deleting', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Keep 1');
        result.current.addMember('Delete Me');
        result.current.addMember('Keep 2');
      });

      const memberToDelete = result.current.members.find(m => m.name === 'Delete Me');

      act(() => {
        result.current.deleteMember(memberToDelete!.id);
      });

      expect(result.current.members).toHaveLength(2);
      expect(result.current.members.find(m => m.name === 'Keep 1')).toBeDefined();
      expect(result.current.members.find(m => m.name === 'Keep 2')).toBeDefined();
    });

    it('should handle deleting non-existent member gracefully', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Existing');
      });

      act(() => {
        result.current.deleteMember('non-existent-id');
      });

      expect(result.current.members).toHaveLength(1);
    });
  });

  describe('getMemberById', () => {
    it('should return member by id', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Find Me');
      });

      const memberId = result.current.members[0].id;
      const member = result.current.getMemberById(memberId);

      expect(member).toBeDefined();
      expect(member!.name).toBe('Find Me');
    });

    it('should return undefined for non-existent id', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const member = result.current.getMemberById('non-existent');

      expect(member).toBeUndefined();
    });

    it('should find correct member among multiple', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('First');
        result.current.addMember('Second');
        result.current.addMember('Third');
      });

      const secondMemberId = result.current.members[1].id;
      const member = result.current.getMemberById(secondMemberId);

      expect(member!.name).toBe('Second');
    });
  });

  describe('persistence', () => {
    it('should persist members to AsyncStorage', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Persisted Member');
      });

      // Wait for persistence
      await waitFor(async () => {
        const stored = await AsyncStorage.getItem('my-meals-family');
        expect(stored).not.toBeNull();
      });

      const stored = await AsyncStorage.getItem('my-meals-family');
      const data = JSON.parse(stored!);

      expect(data.members).toHaveLength(1);
      expect(data.members[0].name).toBe('Persisted Member');
    });

    it('should persist multiple members', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('Member 1');
        result.current.addMember('Member 2');
      });

      await waitFor(async () => {
        const stored = await AsyncStorage.getItem('my-meals-family');
        const data = JSON.parse(stored!);
        expect(data.members.length).toBe(2);
      });
    });

    it('should persist deletions', async () => {
      const { result } = renderHook(() => useFamilyMembers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addMember('To Delete');
      });

      const memberId = result.current.members[0].id;

      act(() => {
        result.current.deleteMember(memberId);
      });

      await waitFor(async () => {
        const stored = await AsyncStorage.getItem('my-meals-family');
        const data = JSON.parse(stored!);
        expect(data.members.length).toBe(0);
      });
    });
  });
});
