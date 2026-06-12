import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Radius } from '../constants/theme';
import { Text } from './ui/Text';
import { useAuthContext } from './AuthProvider';

const logo = require('../assets/images/logo.png');
const { width } = Dimensions.get('window');
const PANEL_W = width * 0.85;

interface NavItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: Href;
}

interface MenuContextValue {
  open: () => void;
  close: () => void;
}
const MenuContext = createContext<MenuContextValue>({ open: () => {}, close: () => {} });
export const useAppMenu = () => useContext(MenuContext);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const slide = useRef(new Animated.Value(PANEL_W)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(slide, { toValue: PANEL_W, duration: 260, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  }, [slide, fade]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slide, fade]);

  const navigate = (href: Href) => {
    close();
    setTimeout(() => router.push(href), 240);
  };

  const otherItems: NavItem[] = [
    { icon: 'information-circle-outline', label: 'OUR STORY', href: '/about' },
    { icon: 'cafe-outline', label: 'MENU', href: '/menu' },
    { icon: 'calendar-outline', label: 'RESERVATIONS', href: '/reservations' },
    { icon: 'images-outline', label: 'GALLERY', href: '/gallery' },
    ...(!isLoggedIn
      ? [{ icon: 'card-outline' as const, label: 'MEMBERSHIP', href: '/membership' as Href }]
      : []),
    { icon: 'mail-outline', label: 'CONTACT US', href: '/contact' },
    { icon: 'share-social-outline', label: 'SOCIALS', href: '/social' },
  ];

  return (
    <MenuContext.Provider value={{ open, close }}>
      {children}
      {visible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fade }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          </Animated.View>

          <Animated.View style={[styles.panel, { transform: [{ translateX: slide }] }]}>
            <SafeAreaView style={styles.panelInner} edges={['top', 'bottom']}>
              <Pressable onPress={close} hitSlop={12} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </Pressable>

              <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {isLoggedIn && (
                  <View style={styles.section}>
                    <Text variant="caption" tracking={3} style={styles.sectionTitle}>
                      MY CAFÉ LOCCO
                    </Text>
                    <NavRow
                      label="MY MEMBERSHIP"
                      onPress={() => navigate('/dashboard')}
                    />
                  </View>
                )}

                <View style={styles.section}>
                  {otherItems.map((item) => (
                    <NavRow key={item.label} label={item.label} onPress={() => navigate(item.href)} />
                  ))}
                </View>
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}
    </MenuContext.Provider>
  );
}

function NavRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed]}
    >
      <Image source={logo} style={styles.navLogo} contentFit="contain" />
      <Text variant="label" tracking={1.5} style={styles.navLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.8)' },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: PANEL_W,
    backgroundColor: '#000',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.border,
  },
  panelInner: { flex: 1, paddingHorizontal: 24 },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    marginTop: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingTop: 32, paddingBottom: 32 },
  section: { marginBottom: 32 },
  sectionTitle: { marginBottom: 16, paddingHorizontal: 8, color: Colors.textPrimary },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 12,
  },
  navRowPressed: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: Colors.gold },
  navLogo: { width: 30, height: 30 },
  navLabel: { flex: 1, textAlign: 'right', paddingRight: 8 },
});
