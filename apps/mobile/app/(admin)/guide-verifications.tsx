import { useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { apiFetch } from '../../src/api/client';
import {
  ErrorView,
  LoadingView,
  ScreenContainer,
  colors,
  spacing,
  typography,
  Button,
  Card,
} from '../../src/components';
import { extractErrorMessage } from '../../src/components/ErrorView';

interface VerificationDocument {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone?: string;
  user_avatar?: string;
  bio?: string;
  years_experience?: number;
  license_number: string;
  license_expiry_date: string | null;
  submission_status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  rejection_reason?: string;
}

export default function GuideVerificationsScreen() {
  const [verifications, setVerifications] = useState<VerificationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({});
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [viewingImage, setViewingImage] = useState<{ docId: number; side: 'front' | 'back' } | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const loadVerifications = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await apiFetch<{ data: VerificationDocument[] }>('/admin/guide-verifications');
      setVerifications(response.data);
    } catch (err) {
      setIsError(true);
      setErrorMsg(extractErrorMessage(err, 'Failed to load verifications'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, []);

  const handleApprove = async (verificationId: number, userId: number) => {
    Alert.alert('Approve Guide', 'Are you sure you want to approve this guide?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            setProcessingId(verificationId);
            await apiFetch(`/admin/guide-verifications/${verificationId}/approve`, {
              method: 'POST',
            });
            Alert.alert('Success', 'Guide has been approved!');
            loadVerifications();
            setExpandedId(null);
          } catch (err) {
            Alert.alert('Error', extractErrorMessage(err, 'Failed to approve guide'));
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  const handleReject = async (verificationId: number) => {
    const reason = rejectReason[verificationId];
    if (!reason || !reason.trim()) {
      Alert.alert('Error', 'Please provide a rejection reason');
      return;
    }

    Alert.alert('Reject Guide', 'Are you sure you want to reject this guide?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Reject',
        onPress: async () => {
          try {
            setProcessingId(verificationId);
            await apiFetch(`/admin/guide-verifications/${verificationId}/reject`, {
              method: 'POST',
              body: { rejection_reason: reason.trim() },
            });
            Alert.alert('Success', 'Guide has been rejected!');
            loadVerifications();
            setExpandedId(null);
            setRejectReason((prev) => {
              const updated = { ...prev };
              delete updated[verificationId];
              return updated;
            });
          } catch (err) {
            Alert.alert('Error', extractErrorMessage(err, 'Failed to reject guide'));
          } finally {
            setProcessingId(null);
          }
        },
      },
    ]);
  };

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={errorMsg} onRetry={loadVerifications} />;

  const filteredVerifications = statusFilter === 'all'
    ? verifications
    : verifications.filter((v) => v.submission_status === statusFilter);

  const pendingCount = verifications.filter((v) => v.submission_status === 'pending').length;
  const approvedCount = verifications.filter((v) => v.submission_status === 'approved').length;
  const rejectedCount = verifications.filter((v) => v.submission_status === 'rejected').length;

  return (
    <>
      {/* Image Viewer Modal */}
      <Modal visible={!!viewingImage} transparent animationType="fade">
        <View style={styles.imageModalContainer}>
          <Pressable style={styles.imageModalOverlay} onPress={() => setViewingImage(null)} />
          <View style={styles.imageModalContent}>
            <View style={styles.imageModalHeader}>
              <Text style={[typography.body, { fontWeight: 'bold', color: '#fff' }]}>
                {viewingImage?.side === 'front' ? '📸 FRONT' : '📸 BACK'} - License ID
              </Text>
              <Pressable
                onPress={() => setViewingImage(null)}
                style={styles.imageModalClose}
              >
                <Text style={styles.imageModalCloseText}>✕</Text>
              </Pressable>
            </View>
            {imageLoading && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            {viewingImage && (
              <Image
                source={{
                  uri: `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/guide-verifications/${viewingImage.docId}/download-${viewingImage.side}`,
                }}
                style={styles.imageModalImage}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
            )}
          </View>
        </View>
      </Modal>

      <ScreenContainer scroll={false} style={{ padding: 0 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Guide Verification</Text>
            <Text style={styles.headerSubtitle}>Review & approve driver's licenses</Text>
          </View>
        </View>

        {/* Status Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {[
            { label: 'Pending', count: pendingCount, status: 'pending' },
            { label: 'Approved', count: approvedCount, status: 'approved' },
            { label: 'Rejected', count: rejectedCount, status: 'rejected' },
            { label: 'All', count: verifications.length, status: 'all' },
          ].map((tab) => (
            <Pressable
              key={tab.status}
              onPress={() => setStatusFilter(tab.status as any)}
              style={[
                styles.tab,
                statusFilter === tab.status && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  statusFilter === tab.status && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              <Text
                style={[
                  styles.tabCount,
                  statusFilter === tab.status && styles.tabCountActive,
                ]}
              >
                {tab.count}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Verifications List */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.listContainer}>
          {filteredVerifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No verifications found</Text>
            </View>
          ) : (
            filteredVerifications.map((verification) => (
              <VerificationCard
                key={verification.id}
                verification={verification}
                isExpanded={expandedId === verification.id}
                onToggleExpand={() =>
                  setExpandedId(expandedId === verification.id ? null : verification.id)
                }
                onApprove={() => handleApprove(verification.id, verification.user_id)}
                onReject={() => handleReject(verification.id)}
                rejectReason={rejectReason[verification.id] || ''}
                onRejectReasonChange={(reason) =>
                  setRejectReason((prev) => ({ ...prev, [verification.id]: reason }))
                }
                isProcessing={processingId === verification.id}
                onViewImage={(side) => setViewingImage({ docId: verification.id, side })}
              />
            ))
          )}
        </ScrollView>
      </ScreenContainer>
    </>
  );
}

interface VerificationCardProps {
  verification: VerificationDocument;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onApprove: () => void;
  onReject: () => void;
  rejectReason: string;
  onRejectReasonChange: (reason: string) => void;
  isProcessing: boolean;
  onViewImage: (side: 'front' | 'back') => void;
}

function VerificationCard({
  verification,
  isExpanded,
  onToggleExpand,
  onApprove,
  onReject,
  rejectReason,
  onRejectReasonChange,
  isProcessing,
  onViewImage,
}: VerificationCardProps) {
  const statusColors = {
    pending: '#FFA500',
    approved: '#4CAF50',
    rejected: '#FF5252',
  };

  return (
    <Pressable onPress={onToggleExpand} style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.guideInfo}>
          <View
            style={[
              styles.guideBadge,
              { backgroundColor: statusColors[verification.submission_status] },
            ]}
          >
            <Text style={styles.guideBadgeText}>
              {verification.user_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.guideDetails}>
            <Text style={styles.guideName}>{verification.user_name}</Text>
            <Text style={styles.guideEmail}>{verification.user_email}</Text>
            <Text style={styles.guideId}>ID: {verification.user_id}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[verification.submission_status] + '20' }]}>
          <Text style={[styles.statusText, { color: statusColors[verification.submission_status] }]}>
            {verification.submission_status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Expand Indicator */}
      <Text style={styles.expandText}>
        {isExpanded ? '▲ Collapse' : '▼ View ID Photos'}
      </Text>

      {/* Expanded Content */}
      {isExpanded && (
        <>
          {/* Guide Profile Information */}
          <View style={styles.expandedSection}>
            <Text style={styles.sectionLabel}>👤 Tour Guide Profile</Text>

            {verification.user_avatar && (
              <Image
                source={{ uri: verification.user_avatar }}
                style={styles.guideAvatarLarge}
              />
            )}

            <View style={styles.profileInfoGrid}>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Name</Text>
                <Text style={styles.profileInfoValue}>{verification.user_name}</Text>
              </View>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Email</Text>
                <Text style={styles.profileInfoValue}>{verification.user_email}</Text>
              </View>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Phone</Text>
                <Text style={styles.profileInfoValue}>{verification.user_phone || 'Not provided'}</Text>
              </View>
              <View style={styles.profileInfoItem}>
                <Text style={styles.profileInfoLabel}>Experience</Text>
                <Text style={styles.profileInfoValue}>{verification.years_experience ?? 0} years</Text>
              </View>
            </View>

            {verification.bio && (
              <View style={styles.bioSection}>
                <Text style={styles.bioLabel}>Bio</Text>
                <Text style={styles.bioText}>{verification.bio}</Text>
              </View>
            )}
          </View>

          {/* License Images */}
          <View style={styles.expandedSection}>
            <Text style={styles.sectionLabel}>📸 Driver's License Photos</Text>

            <View style={styles.imagesContainer}>
              {/* Front Image */}
              <Pressable
                onPress={() => onViewImage('front')}
                style={styles.imagePreviewBox}
              >
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderIcon}>📄</Text>
                  <Text style={styles.imagePlaceholderText}>FRONT SIDE</Text>
                  <Text style={styles.imagePlaceholderHint}>Tap to view</Text>
                </View>
              </Pressable>

              {/* Back Image */}
              <Pressable
                onPress={() => onViewImage('back')}
                style={styles.imagePreviewBox}
              >
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderIcon}>📄</Text>
                  <Text style={styles.imagePlaceholderText}>BACK SIDE</Text>
                  <Text style={styles.imagePlaceholderHint}>Tap to view</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* License Information */}
          <View style={styles.expandedSection}>
            <Text style={styles.sectionLabel}>📋 License Information</Text>
            <DetailRow
              label="License Number"
              value={verification.license_number || 'Not provided'}
            />
            {verification.license_expiry_date && (
              <DetailRow
                label="Expiry Date"
                value={new Date(verification.license_expiry_date).toLocaleDateString()}
              />
            )}
            <DetailRow
              label="Submitted"
              value={new Date(verification.submitted_at).toLocaleString()}
            />
          </View>

          {/* Rejection Reason (if applicable) */}
          {verification.submission_status === 'rejected' && verification.rejection_reason && (
            <View style={styles.rejectionBox}>
              <Text style={styles.rejectionLabel}>Rejection Reason</Text>
              <Text style={styles.rejectionReason}>{verification.rejection_reason}</Text>
            </View>
          )}

          {/* Action Buttons */}
          {verification.submission_status === 'pending' && (
            <>
              <View style={styles.expandedSection}>
                <Text style={styles.sectionLabel}>⚠️ Rejection Reason (if needed)</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Provide reason for rejection..."
                  placeholderTextColor={colors.textMuted}
                  value={rejectReason}
                  onChangeText={onRejectReasonChange}
                  multiline
                  numberOfLines={3}
                  editable={!isProcessing}
                />
              </View>

              <View style={styles.actionContainer}>
                <Pressable
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={onApprove}
                  disabled={isProcessing}
                >
                  <Text style={styles.approveButtonText}>
                    {isProcessing ? 'Processing...' : '✓ APPROVE'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={onReject}
                  disabled={isProcessing || !rejectReason.trim()}
                >
                  <Text style={styles.rejectButtonText}>
                    {isProcessing ? 'Processing...' : '✕ REJECT'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </>
      )}
    </Pressable>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    gap: spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  tab: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  tabLabelActive: {
    color: '#fff',
  },
  tabCount: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabCountActive: {
    color: '#fff',
  },

  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  guideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },

  guideBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  guideBadgeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  guideDetails: {
    flex: 1,
  },

  guideName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },

  guideEmail: {
    fontSize: 12,
    color: colors.textMuted,
  },

  guideId: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  expandText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },

  expandedSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },

  guideAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
    alignSelf: 'center',
  },

  profileInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  profileInfoItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  profileInfoLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  profileInfoValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },

  bioSection: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },

  bioLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  bioText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },

  imagesContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  imagePreviewBox: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },

  imagePlaceholder: {
    flex: 1,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },

  imagePlaceholderIcon: {
    fontSize: 32,
  },

  imagePlaceholderText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },

  imagePlaceholderHint: {
    fontSize: 10,
    color: colors.textMuted,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },

  rejectionBox: {
    backgroundColor: '#FF525220',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#FF5252',
  },

  rejectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },

  rejectionReason: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },

  reasonInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 13,
    color: colors.text,
    minHeight: 80,
  },

  actionContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },

  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  approveButton: {
    backgroundColor: '#4CAF50',
  },

  approveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  rejectButton: {
    backgroundColor: '#FF525220',
    borderWidth: 1,
    borderColor: '#FF5252',
  },

  rejectButtonText: {
    color: '#FF5252',
    fontWeight: '600',
    fontSize: 13,
  },

  // Image Viewer Modal Styles
  imageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  imageModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  imageModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: '90%',
    maxHeight: '85%',
  },

  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  imageModalClose: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageModalCloseText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },

  imageLoadingContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageModalImage: {
    width: '100%',
    height: 500,
    resizeMode: 'contain',
  },
});
