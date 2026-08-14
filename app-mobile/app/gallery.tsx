import React from 'react';
import { View, StyleSheet, FlatList, Dimensions, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { useAppMenu, useReturnToMenuOnBack } from '@/components/AppMenu';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';
import { galleryImages } from '@/constants/galleryImages';

const GUTTER = Spacing.md;
const COLUMNS = 2;
// All source images are portrait 487x745 (~2:3); match the tile ratio so
// contentFit="cover" fills the cell without cropping anything important.
const IMAGE_RATIO = 487 / 745;

const { width: SCREEN_W } = Dimensions.get('window');

/** Gallery — fixed 2-column grid of the 27 bundled images. Display only:
 *  photos are not tappable (no fullscreen viewer, no press feedback). */
export default function GalleryScreen() {
  const { open } = useAppMenu();
  useReturnToMenuOnBack();

  const tileWidth = (SCREEN_W - GUTTER * 2 - GUTTER) / COLUMNS;
  const tileHeight = tileWidth / IMAGE_RATIO;

  return (
    <Screen backgroundColor="#000">
      <Header title="GALLERY" showBack onMenu={open} />

      <FlatList
        data={galleryImages as readonly ImageSourcePropType[]}
        keyExtractor={(_, i) => String(i)}
        numColumns={COLUMNS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: GUTTER }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.tile, { width: tileWidth, height: tileHeight }]}>
            <Image source={item} style={styles.tileImage} contentFit="cover" transition={150} />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { padding: GUTTER, gap: GUTTER },
  tile: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  tileImage: { width: '100%', height: '100%' },
});
