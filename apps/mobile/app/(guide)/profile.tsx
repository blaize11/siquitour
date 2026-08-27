import { useState, useEffect } from 'react';
import { Alert, Text, View, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useSession } from '../../src/auth/SessionContext';
import { apiFetch } from '../../src/api/client';
import { useUpdateGuideProfile } from '../../src/api/queries/guide';
import {
  Button,
  Card,
  TextField,
  ScreenContainer,
  colors,
  spacing,
  typography,
  LoadingView,
  ErrorView,
  VerificationModal,
} from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

interface VerificationStatus {
  status: 'not_submitted' | 'pending_review' | 'approved' | 'rejected';
  message?: string;
  submitted_at?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

interface PaxPrice {
  id: number;
  pax_quantity: number;
  price: string;
}

export default function GuideProfileScreen() {
  const { user, refreshUser } = useSession();
  const updateProfile = useUpdateGuideProfile();

  // Profile fields
  const [bio, setBio] = useState(user?.tour_guide_profile?.bio ?? '');
  const [yearsExperience, setYearsExperience] = useState(
    String(user?.tour_guide_profile?.years_experience ?? '')
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Verification modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loadingVerification, setLoadingVerification] = useState(true);

  // Pricing fields
  const [prices, setPrices] = useState<PaxPrice[]>([]);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [newPaxQuantity, setNewPaxQuantity] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [pricesLoading, setPricesLoading] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState('');

  // Load verification status
  useEffect(() => {
    loadVerificationStatus();
    loadPrices();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      setLoadingVerification(true);
      const status = await apiFetch<VerificationStatus>('/guide/verification/status');
      setVerificationStatus(status);

      // Show modal if not verified
      if (status.status !== 'approved') {
        setShowVerificationModal(true);
      }
    } catch (err) {
      console.log('Verification status error:', err);
      setVerificationStatus({
        status: 'not_submitted',
        message: 'Unable to load verification status',
      });
    } finally {
      setLoadingVerification(false);
    }
  };

  const loadPrices = async () => {
    try {
      setPricesLoading(true);
      const response = await apiFetch<{ pax_prices: PaxPrice[] }>('/guide/prices');
      setPrices(response.pax_prices);
    } catch (err) {
      console.log('Pricing not available');
    } finally {
      setPricesLoading(false);
    }
  };

  // Profile save
  const onSaveProfile = async () => {
    setError(null);
    setSaved(false);
    try {
      await updateProfile.mutateAsync({
        bio,
        years_experience: yearsExperience ? Number(yearsExperience) : undefined,
      });
      await refreshUser();
      setSaved(true);
      Alert.alert('Success', 'Your profile changes have been saved!');
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to save your profile.'));
    }
  };

  // Pricing management
  const addPrice = async () => {
    if (!newPaxQuantity.trim() || !newPrice.trim()) {
      Alert.alert('Error', 'Please enter pax quantity and price');
      return;
    }

    try {
      setPricesLoading(true);
      await apiFetch('/guide/prices', {
        method: 'POST',
        body: {
          pax_quantity: parseInt(newPaxQuantity),
          price: parseFloat(newPrice),
        },
      });
      Alert.alert('Success', 'Price added!');
      setNewPaxQuantity('');
      setNewPrice('');
      setShowAddPrice(false);
      loadPrices();
    } catch (err) {
      Alert.alert('Error', extractErrorMessage(err, 'Failed to add price'));
    } finally {
      setPricesLoading(false);
    }
  };

  const updatePrice = async (priceId: number) => {
    if (!editingPrice.trim()) {
      Alert.alert('Error', 'Please enter a price');
      return;
    }

    try {
      setPricesLoading(true);
      await apiFetch(`/guide/prices/${priceId}`, {
        method: 'PUT',
        body: { price: parseFloat(editingPrice) },
      });
      Alert.alert('Success', 'Price updated!');
      setEditingPriceId(null);
      setEditingPrice('');
      loadPrices();
    } catch (err) {
      Alert.alert('Error', extractErrorMessage(err, 'Failed to update price'));
    } finally {
      setPricesLoading(false);
    }
  };

  const deletePrice = async (priceId: number) => {
    Alert.alert('Delete Price', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            setPricesLoading(true);
            await apiFetch(`/guide/prices/${priceId}`, { method: 'DELETE' });
            loadPrices();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete price');
          } finally {
            setPricesLoading(false);
          }
        },
      },
    ]);
  };

  const isVerified = verificationStatus?.status === 'approved';
  const isPending = verificationStatus?.status === 'pending_review';
  const isRejected = verificationStatus?.status === 'rejected';

  if (loadingVerification) {
    return <LoadingView />;
  }

  return (
    <>
      {/* Verification Modal */}
      <VerificationModal
        visible={showVerificationModal && !isVerified}
        onClose={() => {
          if (!isVerified) {
            // Can't close without verification - but allow dismissing to view profile
            setShowVerificationModal(false);
          }
        }}
        onSuccess={() => {
          setShowVerificationModal(false);
          loadVerificationStatus();
          refreshUser();
        }}
        rejectionReason={isRejected ? verificationStatus?.rejection_reason : undefined}
      />

      {/* Main Profile Screen */}
      <ScreenContainer scroll={true} style={{ padding: 0 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.lg, backgroundColor: colors.primary }}>
          <Text style={[typography.title, { fontSize: 28, color: '#fff', marginBottom: spacing.xs }]}>
            👤 Guide Profile
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' }}>
            {isVerified
              ? '✓ Verified Tour Guide'
              : isPending
                ? '⏳ Pending Review'
                : isRejected
                  ? '⚠️ Resubmit Required'
                  : '📋 Verification Required'}
          </Text>
        </View>

        {/* Verification Status Banner */}
        {!isVerified && (
          <Card
            style={{
              gap: spacing.md,
              margin: spacing.md,
              borderWidth: 2,
              borderColor: isRejected ? colors.danger : isPending ? colors.warning : colors.warning,
              backgroundColor: isRejected ? colors.danger + '10' : isPending ? colors.warning + '10' : colors.warning + '10',
            }}
          >
            {isRejected && (
              <>
                <Text style={[typography.body, { fontWeight: 'bold', color: colors.danger }]}>
                  ⚠️ Application Rejected
                </Text>
                <Text style={[typography.caption, { color: colors.danger }]}>
                  {verificationStatus?.rejection_reason || 'Please resubmit your driver\'s license'}
                </Text>
              </>
            )}
            {isPending && (
              <>
                <Text style={[typography.body, { fontWeight: 'bold', color: colors.warning }]}>
                  ⏳ Verification In Progress
                </Text>
                <Text style={[typography.caption, { color: colors.text }]}>
                  Your application is being reviewed. Please wait 24-48 hours.
                </Text>
              </>
            )}
            {!isPending && !isRejected && (
              <>
                <Text style={[typography.body, { fontWeight: 'bold', color: colors.warning }]}>
                  📋 Verification Required
                </Text>
                <Text style={[typography.caption, { color: colors.text }]}>
                  Submit your driver's license to access all features.
                </Text>
                <Button
                  title="🔐 Start Verification"
                  onPress={() => setShowVerificationModal(true)}
                />
              </>
            )}
          </Card>
        )}

        {/* Profile Editing Section - Only if Verified */}
        {isVerified ? (
          <>
            {/* Basic Profile Info */}
            <Card style={{ gap: spacing.md, margin: spacing.md }}>
              <Text style={[typography.body, { fontWeight: 'bold' }]}>📝 Basic Information</Text>
              <TextField
                label="Bio"
                value={bio}
                onChangeText={setBio}
                multiline
                placeholder="Tell guests about yourself"
              />
              <TextField
                label="Years of Experience"
                value={yearsExperience}
                onChangeText={setYearsExperience}
                keyboardType="number-pad"
              />
              {error && <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text>}
              {saved && <Text style={{ color: colors.success, fontSize: 12 }}>✓ Saved!</Text>}
              <Button title="Save Changes" onPress={onSaveProfile} />
            </Card>

            {/* Per-Pax Pricing Section */}
            <Card style={{ gap: spacing.md, margin: spacing.md }}>
              <Text style={[typography.body, { fontWeight: 'bold' }]}>💰 Per-Pax Pricing</Text>

              {pricesLoading && <ActivityIndicator color={colors.primary} />}

              {/* Price List */}
              {prices.length > 0 && (
                <View style={{ gap: spacing.sm }}>
                  {prices.map((price) => (
                    <View
                      key={price.id}
                      style={{
                        backgroundColor: colors.surface,
                        padding: spacing.md,
                        borderRadius: 8,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {editingPriceId === price.id ? (
                        <View style={{ flex: 1, gap: spacing.sm }}>
                          <TextField
                            label="Price"
                            value={editingPrice}
                            onChangeText={setEditingPrice}
                            keyboardType="decimal-pad"
                          />
                          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                            <Button
                              title="Save"
                              onPress={() => updatePrice(price.id)}
                              style={{ flex: 1 }}
                            />
                            <Button
                              title="Cancel"
                              onPress={() => setEditingPriceId(null)}
                              style={{ flex: 1 }}
                            />
                          </View>
                        </View>
                      ) : (
                        <>
                          <View>
                            <Text style={[typography.body, { fontWeight: 'bold' }]}>
                              {price.pax_quantity} pax
                            </Text>
                            <Text style={[typography.caption]}>
                              ₱{parseFloat(price.price).toLocaleString()}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                            <Pressable
                              onPress={() => {
                                setEditingPriceId(price.id);
                                setEditingPrice(price.price);
                              }}
                              style={{
                                backgroundColor: colors.primary,
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm,
                                borderRadius: 6,
                              }}
                            >
                              <Text
                                style={[
                                  typography.caption,
                                  { color: '#fff', fontWeight: 'bold' },
                                ]}
                              >
                                Edit
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={() => deletePrice(price.id)}
                              style={{
                                backgroundColor: colors.danger,
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.sm,
                                borderRadius: 6,
                              }}
                            >
                              <Text
                                style={[
                                  typography.caption,
                                  { color: '#fff', fontWeight: 'bold' },
                                ]}
                              >
                                Delete
                              </Text>
                            </Pressable>
                          </View>
                        </>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Add Price Form */}
              {showAddPrice ? (
                <View style={{ gap: spacing.sm }}>
                  <TextField
                    label="Number of Guests"
                    placeholder="1-20"
                    value={newPaxQuantity}
                    onChangeText={setNewPaxQuantity}
                    keyboardType="number-pad"
                    editable={!pricesLoading}
                  />
                  <TextField
                    label="Price (₱)"
                    placeholder="0.00"
                    value={newPrice}
                    onChangeText={setNewPrice}
                    keyboardType="decimal-pad"
                    editable={!pricesLoading}
                  />
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <Button
                      title={pricesLoading ? 'Adding...' : '✓ Add'}
                      onPress={addPrice}
                      disabled={!newPaxQuantity.trim() || !newPrice.trim() || pricesLoading}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Cancel"
                      onPress={() => {
                        setShowAddPrice(false);
                        setNewPaxQuantity('');
                        setNewPrice('');
                      }}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              ) : (
                <Button title="➕ Add Price" onPress={() => setShowAddPrice(true)} />
              )}
            </Card>
          </>
        ) : (
          <Card style={{ gap: spacing.md, margin: spacing.md, backgroundColor: colors.surface }}>
            <Text style={[typography.body, { fontWeight: 'bold' }]}>🔒 Profile Locked</Text>
            <Text style={[typography.caption, { color: colors.text }]}>
              Complete driver's license verification to edit your profile and manage pricing.
            </Text>
            <Button
              title="🔐 Open Verification"
              onPress={() => setShowVerificationModal(true)}
            />
          </Card>
        )}

        <View style={{ height: spacing.lg }} />
      </ScreenContainer>
    </>
  );
}
