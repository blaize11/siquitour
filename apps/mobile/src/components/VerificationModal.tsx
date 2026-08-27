import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../api/client';
import { colors, spacing, typography, Button, Card, ScreenContainer } from './index';
import { extractErrorMessage } from './ErrorView';

const { width } = Dimensions.get('window');

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rejectionReason?: string;
}

export default function VerificationModal({
  visible,
  onClose,
  onSuccess,
  rejectionReason,
}: VerificationModalProps) {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.error('Camera permission error:', err);
      return false;
    }
  };

  const pickImage = async (side: 'front' | 'back') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (side === 'front') {
          setFrontImage(result.assets[0].uri);
        } else {
          setBackImage(result.assets[0].uri);
        }
        setError(null);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to open image library');
    }
  };

  const takePhoto = async (side: 'front' | 'back') => {
    try {
      const hasPermission = await requestCameraPermission();

      if (!hasPermission) {
        Alert.alert(
          'Camera Access Required',
          'Please enable camera access in your device settings.',
          [
            { text: 'OK' },
            { text: 'Use File Instead', onPress: () => pickImage(side) }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets[0]) {
        if (side === 'front') {
          setFrontImage(result.assets[0].uri);
        } else {
          setBackImage(result.assets[0].uri);
        }
        setError(null);
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert('Camera Error', 'Failed to open camera.', [
        { text: 'OK' },
        { text: 'Choose File', onPress: () => pickImage(side) }
      ]);
    }
  };

  const handleSubmit = async () => {
    if (!frontImage || !backImage) {
      setError('Please provide both FRONT and BACK images of your driver\'s license');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create FormData with proper file structure for React Native
      const formData = new FormData();

      // Append front image
      const frontImageName = `license_front_${Date.now()}.jpg`;
      formData.append('driver_license_front_file', {
        uri: frontImage,
        type: 'image/jpeg',
        name: frontImageName,
      } as any);

      // Append back image
      const backImageName = `license_back_${Date.now()}.jpg`;
      formData.append('driver_license_back_file', {
        uri: backImage,
        type: 'image/jpeg',
        name: backImageName,
      } as any);

      console.log('Submitting verification with files:', {
        front: frontImageName,
        back: backImageName,
      });

      const response = await apiFetch('/guide/verification/submit', {
        method: 'POST',
        body: formData,
      });

      console.log('Submission response:', response);

      Alert.alert(
        'Success',
        'Your driver\'s license has been submitted for verification. Admin will review your application.'
      );
      setFrontImage(null);
      setBackImage(null);
      onSuccess();
    } catch (err) {
      console.error('Submission error:', err);
      setError(extractErrorMessage(err, 'Failed to submit verification'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScreenContainer scroll={true} style={{ padding: 0 }}>
        {/* Premium Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🔐 Account Verification</Text>
            <Text style={styles.headerSubtitle}>Become a Verified Tour Guide</Text>
          </View>
        </View>

        {/* Rejection Warning */}
        {rejectionReason && (
          <View style={styles.rejectionWarning}>
            <Text style={styles.rejectionIcon}>⚠️</Text>
            <View style={styles.rejectionContent}>
              <Text style={styles.rejectionTitle}>Previous Application Rejected</Text>
              <Text style={styles.rejectionReason}>{rejectionReason}</Text>
              <Text style={styles.rejectionHint}>Please resubmit with clearer photos</Text>
            </View>
          </View>
        )}

        {/* Instructions Card */}
        <Card style={styles.instructionsCard}>
          <View style={styles.instructionHeader}>
            <Text style={styles.instructionIcon}>📋</Text>
            <Text style={styles.instructionTitle}>What You Need</Text>
          </View>
          <Text style={styles.instructionText}>
            Clear photos of both sides of your valid driver's license. Make sure the text is readable and there are no shadows or glare.
          </Text>
          <View style={styles.checklistContainer}>
            {['Clear & well-lit photos', 'All text readable', 'No shadows or glare', 'BOTH sides required'].map((item, index) => (
              <View key={index} style={styles.checklistItem}>
                <Text style={styles.checklistIcon}>✓</Text>
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Front Side Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>1</Text>
            <Text style={styles.sectionTitle}>FRONT OF DRIVER'S LICENSE</Text>
          </View>

          {frontImage ? (
            <View style={styles.imagePreviewSection}>
              <Image source={{ uri: frontImage }} style={styles.imagePreview} />
              <Text style={styles.imageCheckmark}>✓ Image selected</Text>
              <View style={styles.imageActionButtons}>
                <Pressable
                  style={[styles.imageActionButton, styles.imageRetakeButton]}
                  onPress={() => takePhoto('front')}
                  disabled={isLoading}
                >
                  <Text style={styles.imageActionButtonText}>📷 Retake Photo</Text>
                </Pressable>
                <Pressable
                  style={[styles.imageActionButton, styles.imageChangeButton]}
                  onPress={() => pickImage('front')}
                  disabled={isLoading}
                >
                  <Text style={styles.imageActionButtonText}>🗂️ Change</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.imageButtonsContainer}>
              <Pressable
                style={styles.largeButton}
                onPress={() => takePhoto('front')}
                disabled={isLoading}
              >
                <Text style={styles.largeButtonIcon}>📷</Text>
                <Text style={styles.largeButtonTitle}>Take a Photo</Text>
                <Text style={styles.largeButtonSubtitle}>Use your camera</Text>
              </Pressable>
              <Pressable
                style={styles.largeButton}
                onPress={() => pickImage('front')}
                disabled={isLoading}
              >
                <Text style={styles.largeButtonIcon}>🗂️</Text>
                <Text style={styles.largeButtonTitle}>Choose from Device</Text>
                <Text style={styles.largeButtonSubtitle}>Use existing photo</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Back Side Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>2</Text>
            <Text style={styles.sectionTitle}>BACK OF DRIVER'S LICENSE</Text>
          </View>

          {backImage ? (
            <View style={styles.imagePreviewSection}>
              <Image source={{ uri: backImage }} style={styles.imagePreview} />
              <Text style={styles.imageCheckmark}>✓ Image selected</Text>
              <View style={styles.imageActionButtons}>
                <Pressable
                  style={[styles.imageActionButton, styles.imageRetakeButton]}
                  onPress={() => takePhoto('back')}
                  disabled={isLoading}
                >
                  <Text style={styles.imageActionButtonText}>📷 Retake Photo</Text>
                </Pressable>
                <Pressable
                  style={[styles.imageActionButton, styles.imageChangeButton]}
                  onPress={() => pickImage('back')}
                  disabled={isLoading}
                >
                  <Text style={styles.imageActionButtonText}>🗂️ Change</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.imageButtonsContainer}>
              <Pressable
                style={styles.largeButton}
                onPress={() => takePhoto('back')}
                disabled={isLoading}
              >
                <Text style={styles.largeButtonIcon}>📷</Text>
                <Text style={styles.largeButtonTitle}>Take a Photo</Text>
                <Text style={styles.largeButtonSubtitle}>Use your camera</Text>
              </Pressable>
              <Pressable
                style={styles.largeButton}
                onPress={() => pickImage('back')}
                disabled={isLoading}
              >
                <Text style={styles.largeButtonIcon}>🗂️</Text>
                <Text style={styles.largeButtonTitle}>Choose from Device</Text>
                <Text style={styles.largeButtonSubtitle}>Use existing photo</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Status */}
        {frontImage && backImage && !error && (
          <View style={styles.readyCard}>
            <Text style={styles.readyIcon}>✓</Text>
            <Text style={styles.readyText}>Both photos ready! Click submit to continue</Text>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>❌</Text>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Submission Failed</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorHint}>
                • Make sure images are clear JPEG or PNG files{'\n'}
                • Each file should be less than 5MB{'\n'}
                • Try taking new photos or choosing different files
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title={isLoading ? '⏳ Submitting...' : '✓ Submit for Verification'}
            onPress={handleSubmit}
            disabled={!frontImage || !backImage || isLoading}
          />
          <Text style={styles.submitHint}>
            After submission, our admin team will review your documents within 24-48 hours.
          </Text>
        </View>

        <View style={{ height: spacing.lg }} />
      </ScreenContainer>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
    gap: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  rejectionWarning: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    backgroundColor: '#FF525220',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
  },
  rejectionIcon: {
    fontSize: 24,
  },
  rejectionContent: {
    flex: 1,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF5252',
    marginBottom: spacing.xs,
  },
  rejectionReason: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  rejectionHint: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  instructionsCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.primary + '08',
    borderColor: colors.primary + '30',
    borderWidth: 1,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  instructionIcon: {
    fontSize: 20,
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  instructionText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
  checklistContainer: {
    gap: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checklistIcon: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '700',
  },
  checklistText: {
    fontSize: 12,
    color: colors.text,
  },

  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },

  imageButtonsContainer: {
    gap: spacing.md,
  },
  largeButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary + '08',
  },
  largeButtonIcon: {
    fontSize: 40,
  },
  largeButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  largeButtonSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },

  imagePreviewSection: {
    gap: spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  imageCheckmark: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '700',
    textAlign: 'center',
  },
  imageActionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  imageActionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageRetakeButton: {
    backgroundColor: colors.primary,
  },
  imageChangeButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageActionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },

  readyCard: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    backgroundColor: colors.success + '20',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  readyIcon: {
    fontSize: 28,
  },
  readyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    textAlign: 'center',
  },

  errorCard: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    backgroundColor: colors.danger + '20',
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
    flexDirection: 'row',
    gap: spacing.md,
  },
  errorIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  errorContent: {
    flex: 1,
    gap: spacing.xs,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  errorHint: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 16,
    marginTop: spacing.xs,
  },

  submitSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  submitHint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
