import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSession } from '../auth/SessionContext';
import {
  useGetGuideProfile,
  useUpdateGuideProfile,
  useAddGuideInclusion,
  useDeleteGuideInclusion,
  useUpdateGuideInclusion,
  type GuideInclusion,
  type TourGuideProfile,
} from '../api/queries/profile';
import { Button, ScreenContainer, colors, spacing, typography } from '../components';

export function GuideProfileEditScreen() {
  const { user } = useSession();
  const { data: profile, isLoading, error } = useGetGuideProfile();
  const updateProfile = useUpdateGuideProfile();
  const addInclusion = useAddGuideInclusion();
  const updateInclusion = useUpdateGuideInclusion();
  const deleteInclusion = useDeleteGuideInclusion();

  // Form state for profile
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [ratePerPax, setRatePerPax] = useState('');
  const [additionalServices, setAdditionalServices] = useState('');

  // Inclusion state
  const [newInclusionLabel, setNewInclusionLabel] = useState('');
  const [editingInclusionId, setEditingInclusionId] = useState<number | null>(null);
  const [editingInclusionLabel, setEditingInclusionLabel] = useState('');

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setYearsExperience(profile.years_experience?.toString() || '');
      setRatePerPax(profile.rate_per_pax?.toString() || '');
      setAdditionalServices(profile.additional_services || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        bio: bio || undefined,
        years_experience: yearsExperience ? parseInt(yearsExperience, 10) : undefined,
        rate_per_pax: ratePerPax ? parseFloat(ratePerPax) : undefined,
        additional_services: additionalServices || undefined,
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleAddInclusion = async () => {
    if (!newInclusionLabel.trim()) {
      Alert.alert('Error', 'Please enter an inclusion label');
      return;
    }

    try {
      await addInclusion.mutateAsync(newInclusionLabel.trim());
      setNewInclusionLabel('');
      Alert.alert('Success', 'Inclusion added');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add inclusion');
    }
  };

  const handleDeleteInclusion = (inclusionId: number) => {
    Alert.alert('Delete Inclusion', 'Are you sure you want to delete this inclusion?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteInclusion.mutateAsync(inclusionId);
            Alert.alert('Success', 'Inclusion deleted');
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete inclusion');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEditInclusion = async (inclusion: GuideInclusion) => {
    if (!editingInclusionLabel.trim()) {
      Alert.alert('Error', 'Please enter an inclusion label');
      return;
    }

    try {
      await updateInclusion.mutateAsync({
        inclusionId: inclusion.id,
        label: editingInclusionLabel.trim(),
      });
      setEditingInclusionId(null);
      setEditingInclusionLabel('');
      Alert.alert('Success', 'Inclusion updated');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update inclusion');
    }
  };

  if (!user || user.role !== 'tour_guide') {
    return (
      <ScreenContainer>
        <Text style={styles.errorText}>⚠️ Only tour guides can access this page</Text>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error || !profile) {
    return (
      <ScreenContainer>
        <Text style={styles.errorText}>❌ Failed to load profile</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Profile Information</Text>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Tell guests about yourself..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={bio}
              onChangeText={setBio}
            />
          </View>

          {/* Years Experience */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Years of Experience</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 5"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={yearsExperience}
              onChangeText={setYearsExperience}
            />
          </View>

          {/* Rate Per Pax */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rate per Person (₱)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 1500"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={ratePerPax}
              onChangeText={setRatePerPax}
            />
          </View>

          {/* Additional Services */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Services</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Photography, Special meals"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={additionalServices}
              onChangeText={setAdditionalServices}
            />
          </View>

          <Button
            title={updateProfile.isPending ? 'Saving...' : 'Save Profile'}
            onPress={handleSaveProfile}
            disabled={updateProfile.isPending}
          />
        </View>

        {/* Inclusions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ What's Included in Your Tours</Text>
          <Text style={styles.sectionDescription}>
            Tell guests what's included in your tour packages (meals, transport, accommodation, etc.)
          </Text>

          {/* Add New Inclusion */}
          <View style={styles.addInclusionContainer}>
            <TextInput
              style={styles.inclusionInput}
              placeholder="e.g., Breakfast, Hotel, Transportation"
              placeholderTextColor={colors.textMuted}
              value={newInclusionLabel}
              onChangeText={setNewInclusionLabel}
            />
            <Pressable
              style={[styles.addButton, addInclusion.isPending && styles.addButtonDisabled]}
              onPress={handleAddInclusion}
              disabled={addInclusion.isPending}
            >
              <Text style={styles.addButtonText}>
                {addInclusion.isPending ? '⏳' : '➕'}
              </Text>
            </Pressable>
          </View>

          {/* Inclusions List */}
          {profile.inclusions && profile.inclusions.length > 0 ? (
            <FlatList
              data={profile.inclusions}
              scrollEnabled={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.inclusionItem}>
                  {editingInclusionId === item.id ? (
                    // Edit mode
                    <View style={styles.editInclusionContainer}>
                      <TextInput
                        style={styles.editInclusionInput}
                        value={editingInclusionLabel}
                        onChangeText={setEditingInclusionLabel}
                        placeholder="Enter inclusion name"
                        placeholderTextColor={colors.textMuted}
                      />
                      <View style={styles.editButtons}>
                        <Pressable
                          style={styles.saveEditButton}
                          onPress={() => handleEditInclusion(item)}
                        >
                          <Text style={styles.saveEditButtonText}>✓</Text>
                        </Pressable>
                        <Pressable
                          style={styles.cancelEditButton}
                          onPress={() => {
                            setEditingInclusionId(null);
                            setEditingInclusionLabel('');
                          }}
                        >
                          <Text style={styles.cancelEditButtonText}>✕</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    // View mode
                    <>
                      <Text style={styles.inclusionLabel}>✓ {item.label}</Text>
                      <View style={styles.inclusionActions}>
                        <Pressable
                          style={styles.editIconButton}
                          onPress={() => {
                            setEditingInclusionId(item.id);
                            setEditingInclusionLabel(item.label);
                          }}
                        >
                          <Text style={styles.editIcon}>✏️</Text>
                        </Pressable>
                        <Pressable
                          style={styles.deleteIconButton}
                          onPress={() => handleDeleteInclusion(item.id)}
                        >
                          <Text style={styles.deleteIcon}>🗑️</Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No inclusions added yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Add at least one to help guests understand what's included
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  addInclusionContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  inclusionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 20,
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inclusionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  inclusionActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editIconButton: {
    padding: spacing.sm,
  },
  editIcon: {
    fontSize: 18,
  },
  deleteIconButton: {
    padding: spacing.sm,
  },
  deleteIcon: {
    fontSize: 18,
  },
  editInclusionContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  editInclusionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  editButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  saveEditButton: {
    backgroundColor: colors.success || '#10b981',
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveEditButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelEditButton: {
    backgroundColor: colors.danger,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelEditButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: colors.danger,
    textAlign: 'center',
  },
});
