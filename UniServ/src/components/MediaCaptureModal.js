import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { useUser } from '../context/UserContext';

export const MediaCaptureModal = ({
  visible,
  onClose,
  onImageSelected
}) => {
  const { t } = useUser();

  const handleLaunchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', t('cameraPermissionDenied'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
        onClose();
      }
    } catch (e) {
      console.warn('Camera error, fallback to demo capture:', e);
      // On web without active webcam or permission
      onImageSelected('https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80');
      onClose();
    }
  };

  const handleLaunchGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery access is needed to pick an existing image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
        onClose();
      }
    } catch (e) {
      console.warn('Gallery error:', e);
      onImageSelected('https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t('choosePhotoSource')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Option 1: Take Photo with Camera */}
          <TouchableOpacity
            style={styles.optionBtn}
            onPress={handleLaunchCamera}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primarySubtle }]}>
              <Ionicons name="camera" size={22} color={colors.primary} />
            </View>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>{t('takePhotoCamera')}</Text>
              <Text style={styles.optionSub}>Open device camera to capture live incident</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Option 2: Choose from Gallery / Files */}
          <TouchableOpacity
            style={styles.optionBtn}
            onPress={handleLaunchGallery}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.successLight }]}>
              <Ionicons name="images" size={22} color={colors.successDark} />
            </View>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>{t('chooseGallery')}</Text>
              <Text style={styles.optionSub}>Select existing screenshot or photo from files</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end'
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary
  },
  closeBtn: {
    padding: 4
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  optionTextCol: {
    flex: 1,
    marginRight: 8
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  optionSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary
  }
});

export default MediaCaptureModal;
