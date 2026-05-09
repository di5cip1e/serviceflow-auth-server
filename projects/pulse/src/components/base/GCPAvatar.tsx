import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';

type AvatarSize = 'small' | 'medium' | 'large';
type AvatarStatus = 'online' | 'offline' | 'away' | 'none';

interface GCPAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  style?: ViewStyle;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getSizeValue = (size: AvatarSize): number => {
  switch (size) {
    case 'small': return 32;
    case 'medium': return 48;
    case 'large': return 80;
  }
};

const getStatusColor = (status: AvatarStatus): string => {
  switch (status) {
    case 'online': return '#10B981';
    case 'offline': return '#6B7280';
    case 'away': return '#F59E0B';
    case 'none': return 'transparent';
  }
};

export const GCPAvatar: React.FC<GCPAvatarProps> = ({
  name = '',
  imageUrl,
  size = 'medium',
  status = 'none',
  style,
}) => {
  const dimension = getSizeValue(size);
  const statusSize = dimension * 0.25;
  const fontSize = dimension * 0.4;

  return (
    <View style={[styles.container, { width: dimension, height: dimension }, style]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
        />
      ) : (
        <View style={[styles.placeholder, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}>
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </View>
      )}
      {status !== 'none' && (
        <View style={[
          styles.status,
          {
            width: statusSize,
            height: statusSize,
            borderRadius: statusSize / 2,
            backgroundColor: getStatusColor(status),
          },
        ]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#6B7280',
    fontWeight: '600',
  },
  status: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
