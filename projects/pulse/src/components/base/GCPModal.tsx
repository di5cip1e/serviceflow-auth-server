import React from 'react';
import { 
  View, 
  Text, 
  Modal as RNModal, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';

type ModalVariant = 'bottomSheet' | 'fullScreen';

interface GCPModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  variant?: ModalVariant;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GCPModal: React.FC<GCPModalProps> = ({
  visible,
  onClose,
  title,
  variant = 'bottomSheet',
  children,
  style,
}) => {
  if (variant === 'fullScreen') {
    return (
      <RNModal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.fullScreenContainer}
        >
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            {title && <Text style={styles.fullScreenTitle}>{title}</Text>}
          </View>
          <View style={styles.fullScreenContent}>{children}</View>
        </KeyboardAvoidingView>
      </RNModal>
    );
  }

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={[styles.sheet, style]}>
                <View style={styles.handle} />
                {title && <Text style={styles.title}>{title}</Text>}
                {children}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  closeText: {
    fontSize: 24,
    color: '#6B7280',
    lineHeight: 26,
  },
  fullScreenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  fullScreenContent: {
    flex: 1,
    padding: 16,
  },
});
