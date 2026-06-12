import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Screen } from '@/components/ui/Screen';
import { Header } from '@/components/ui/Header';
import { Text } from '@/components/ui/Text';
import { useAppMenu } from '@/components/AppMenu';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/theme';
import { galleryImages } from '@/constants/galleryImages';

const GUTTER = Spacing.md;
const COLUMNS = 2;
// All source images are portrait 487x745 (~2:3); match the tile ratio so
// contentFit="cover" fills the cell without cropping anything important.
const IMAGE_RATIO = 487 / 745;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** Gallery — fixed 2-column grid of the 27 bundled images, with a
 *  full-screen left/right swipe viewer that preserves order 01 -> 27. */
export default function GalleryScreen() {
  const { open } = useAppMenu();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

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
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => setViewerIndex(index)}
            style={({ pressed }) => [
              styles.tile,
              { width: tileWidth, height: tileHeight },
              pressed && styles.tilePressed,
            ]}
          >
            <Image source={item} style={styles.tileImage} contentFit="cover" transition={150} />
          </Pressable>
        )}
      />

      {/* Full-screen swipe viewer */}
      <Modal
        visible={viewerIndex !== null}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setViewerIndex(null)}
        statusBarTranslucent
      >
        <FullscreenViewer
          startIndex={viewerIndex ?? 0}
          onClose={() => setViewerIndex(null)}
        />
      </Modal>
    </Screen>
  );
}

function FullscreenViewer({ startIndex, onClose }: { startIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(startIndex);
  const listRef = useRef<FlatList>(null);

  return (
    <View style={styles.viewer}>
      <FlatList
        ref={listRef}
        data={galleryImages as readonly ImageSourcePropType[]}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        initialScrollIndex={startIndex}
        getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setCurrent(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
        }
        renderItem={({ item }) => (
          <View style={styles.page}>
            <Image source={item} style={styles.fullImage} contentFit="contain" />
          </View>
        )}
      />

      <SafeAreaView style={styles.viewerOverlay} pointerEvents="box-none" edges={['top', 'bottom']}>
        <View style={styles.viewerTop}>
          <Pressable onPress={onClose} hitSlop={14} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.white} />
          </Pressable>
        </View>
        <View style={styles.viewerBottom}>
          <Text variant="caption" tracking={2} color={Colors.white}>
            {current + 1} / {galleryImages.length}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { padding: GUTTER, gap: GUTTER },
  tile: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  tilePressed: { opacity: 0.85 },
  tileImage: { width: '100%', height: '100%' },

  viewer: { flex: 1, backgroundColor: '#000' },
  page: { width: SCREEN_W, height: SCREEN_H, alignItems: 'center', justifyContent: 'center' },
  fullImage: { width: SCREEN_W, height: SCREEN_H },
  viewerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-between' },
  viewerTop: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerBottom: { alignItems: 'center', paddingBottom: Spacing.lg },
});
