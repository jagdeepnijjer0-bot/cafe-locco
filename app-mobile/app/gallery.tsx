import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { useAppMenu } from '@/components/AppMenu';
import { useGallery } from '@/hooks/useGallery';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';
import { GalleryImage } from '@/lib/types';

const { width } = Dimensions.get('window');
const GUTTER = Spacing.md;
const COLUMN_WIDTH = (width - GUTTER * 2 - GUTTER) / 2;

/** Gallery — dark-theme 2-column photo grid backed by the gallery hook. */
export default function GalleryScreen() {
  const { open } = useAppMenu();
  const { images, loading, refreshing, refresh } = useGallery();

  // Split images into two balanced columns for a masonry-style layout.
  const columns: GalleryImage[][] = [[], []];
  images.forEach((img, i) => {
    columns[i % 2].push(img);
  });

  return (
    <Screen backgroundColor="#000">
      <Header title="GALLERY" showBack onMenu={open} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.gold} size="large" />
        </View>
      ) : images.length === 0 ? (
        <View style={styles.center}>
          <Text variant="heading" tracking={3} color={Colors.textMuted} center>
            GALLERY COMING SOON
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Colors.gold}
              colors={[Colors.gold]}
            />
          }
        >
          <View style={styles.grid}>
            {columns.map((column, colIndex) => (
              <View key={colIndex} style={styles.column}>
                {column.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.image}
                      contentFit="cover"
                      transition={250}
                    />
                    {item.caption ? (
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.captionWrap}
                      >
                        <Text
                          variant="caption"
                          tracking={1}
                          color={Colors.gold}
                          numberOfLines={2}
                        >
                          {item.caption}
                        </Text>
                      </LinearGradient>
                    ) : null}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: GUTTER,
  },
  grid: {
    flexDirection: 'row',
    gap: GUTTER,
  },
  column: {
    flex: 1,
    gap: GUTTER,
  },
  card: {
    width: COLUMN_WIDTH,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  captionWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
});
