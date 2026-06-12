import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppMenu } from '@/components/AppMenu';
import { useAuthContext } from '@/components/AuthProvider';
import { useGallery } from '@/hooks/useGallery';
import { isAdminEmail, uploadGalleryImage, deleteGalleryImage } from '@/lib/galleryAdmin';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';

/** Admin-only screen to upload / remove gallery photos. Route: /admin/gallery */
export default function AdminGalleryScreen() {
  const { open } = useAppMenu();
  const { user, isLoggedIn } = useAuthContext();
  const { images, loading, refresh, refreshing } = useGallery();
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const admin = isLoggedIn && isAdminEmail(user?.email);

  const pickAndUpload = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      await uploadGalleryImage({ uri: result.assets[0].uri, caption });
      setCaption('');
      await refresh();
      Alert.alert('Uploaded', 'The photo is now live in the gallery.');
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message ?? 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = (id: string, url: string) => {
    Alert.alert('Remove photo', 'Remove this photo from the gallery?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGalleryImage(id, url);
            await refresh();
          } catch (e: any) {
            Alert.alert('Could not remove', e?.message ?? 'Please try again.');
          }
        },
      },
    ]);
  };

  if (!admin) {
    return (
      <Screen contentStyle={styles.center}>
        <Header title="GALLERY ADMIN" showBack onMenu={open} />
        <View style={styles.gate}>
          <Ionicons name="lock-closed-outline" size={28} color={Colors.gold} />
          <Text variant="heading" center tracking={3} style={styles.gateTitle}>
            ADMIN ONLY
          </Text>
          <Text variant="body" center>
            {isLoggedIn
              ? 'This account is not authorised to manage the gallery.'
              : 'Sign in with an admin account to manage the gallery.'}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="GALLERY ADMIN" showBack onMenu={open} />
      <View style={styles.uploadBox}>
        <Input
          label="Caption (optional)"
          placeholder="e.g. Sunday brunch"
          value={caption}
          onChangeText={setCaption}
        />
        <Button
          label={uploading ? 'UPLOADING…' : 'UPLOAD PHOTO'}
          onPress={pickAndUpload}
          loading={uploading}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshing={refreshing}
          onRefresh={refresh}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: Spacing.sm }}
          renderItem={({ item }) => (
            <View style={styles.tile}>
              <Image source={{ uri: item.image_url }} style={styles.tileImg} contentFit="cover" />
              <Pressable style={styles.delBtn} onPress={() => confirmDelete(item.id, item.image_url)}>
                <Ionicons name="trash-outline" size={16} color={Colors.white} />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text variant="body" center style={{ marginTop: Spacing.xl }}>
              No photos yet — upload the first one above.
            </Text>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  gateTitle: { marginTop: Spacing.sm },
  uploadBox: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.sm },
  grid: { padding: Spacing.lg, gap: Spacing.sm },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  tileImg: { width: '100%', height: '100%' },
  delBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
