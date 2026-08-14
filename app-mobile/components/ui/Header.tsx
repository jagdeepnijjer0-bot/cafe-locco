import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Text } from './Text';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onMenu?: () => void;
  /** Custom back handler. When provided, the back chevron always shows and
   *  calls this instead of the default router.back(). */
  onBack?: () => void;
}

/** Top bar: optional back chevron (left) + title + hamburger (right). */
export function Header({ title, showBack = true, onMenu, onBack }: HeaderProps) {
  const router = useRouter();
  const canBack = showBack && (onBack != null || router.canGoBack());
  return (
    <View style={styles.wrap}>
      <View style={styles.side}>
        {canBack ? (
          <Pressable onPress={onBack ?? (() => router.back())} hitSlop={12} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>

      {title ? (
        <Text variant="heading" tracking={3} numberOfLines={1}>
          {title.toUpperCase()}
        </Text>
      ) : (
        <View />
      )}

      <View style={[styles.side, styles.right]}>
        {onMenu ? (
          <Pressable onPress={onMenu} hitSlop={12} style={styles.iconBtn}>
            <Ionicons name="menu" size={26} color={Colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  side: { width: 44, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
