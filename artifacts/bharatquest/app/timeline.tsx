import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Heading, IconButton, Pill, ProgressBar, Screen } from '@/components/game-ui';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';

const chapters = [
  { name: 'Ancient', detail: 'Game chapter', threshold: 0, icon: 'sunrise' as const },
  { name: 'Medieval', detail: 'Future game chapter', threshold: 500, icon: 'compass' as const },
  { name: 'Colonial', detail: 'Future game chapter', threshold: 1000, icon: 'map' as const },
  { name: 'Modern', detail: 'Future game chapter', threshold: 1500, icon: 'flag' as const },
];

export default function TimelineScreen() {
  const colors = useColors();
  const router = useRouter();
  const { progress } = useGame();
  const next = chapters.find((chapter) => progress.xp < chapter.threshold);

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" label="Back" onPress={() => router.back()} />
        <View style={styles.spacer} />
      </View>
      <Heading
        title="Journey through time"
        subtitle="A progression concept for future game chapters. These eras are not assigned to individual sites."
        eyebrow="GAME CHAPTERS · NOT SITE DATES"
      />
      <View style={[styles.notice, { backgroundColor: colors.accent }]}>
        <Feather name="info" size={16} color={colors.accentForeground} />
        <Text style={[styles.noticeText, { color: colors.accentForeground }]}>
          Chapter names are game progression labels only. Site facts remain attached to their UNESCO records.
        </Text>
      </View>
      <View style={styles.timeline}>
        {chapters.map((chapter, index) => {
          const unlocked = progress.xp >= chapter.threshold;
          const current = unlocked && (!chapters[index + 1] || progress.xp < chapters[index + 1].threshold);
          return (
            <View key={chapter.name} style={styles.timelineRow}>
              <View style={styles.rail}>
                <View style={[styles.node, { backgroundColor: unlocked ? colors.jade : colors.secondary, borderColor: unlocked ? colors.jade : colors.border }]}>
                  <Feather name={unlocked ? 'check' : 'lock'} size={13} color={unlocked ? colors.onDark : colors.mutedForeground} />
                </View>
                {index < chapters.length - 1 ? (
                  <View style={[styles.connector, { backgroundColor: progress.xp >= chapters[index + 1].threshold ? colors.jade : colors.border }]} />
                ) : null}
              </View>
              <View style={[styles.chapter, { backgroundColor: colors.card, borderColor: current ? colors.saffron : colors.border }]}>
                <View style={styles.chapterTop}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.chapterName, { color: colors.foreground }]}>{chapter.name}</Text>
                    <Text style={[styles.chapterDetail, { color: colors.mutedForeground }]}>{chapter.detail}</Text>
                  </View>
                  <Pill tone={current ? 'saffron' : unlocked ? 'jade' : 'muted'}>
                    {current ? 'CURRENT' : unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </Pill>
                </View>
                <Text style={[styles.threshold, { color: colors.mutedForeground }]}>
                  {chapter.threshold === 0 ? 'Starting chapter' : `${chapter.threshold} XP to unlock`}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.bottom}>
        <Text style={[styles.bottomTitle, { color: colors.foreground }]}>
          {next ? `${Math.max(0, next.threshold - progress.xp)} XP to the next chapter` : 'All current chapters unlocked'}
        </Text>
        <ProgressBar value={progress.xp % 500} total={500} />
        <Text style={[styles.chapterDetail, { color: colors.mutedForeground }]}>
          Complete missions to unlock new chapters.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row' },
  spacer: { flex: 1 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 13, borderRadius: 16 },
  noticeText: { flex: 1, fontSize: 10, lineHeight: 16, fontWeight: '600' },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', minHeight: 106, gap: 12 },
  rail: { width: 28, alignItems: 'center' },
  node: { width: 28, height: 28, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  connector: { width: 2, flex: 1, marginVertical: -1 },
  chapter: { flex: 1, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 18, padding: 14, gap: 8, marginBottom: 13 },
  chapterTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chapterName: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '700' },
  chapterDetail: { fontSize: 10, lineHeight: 15 },
  threshold: { fontSize: 9, fontWeight: '700' },
  bottom: { gap: 9, paddingTop: 4 },
  bottomTitle: { fontSize: 13, fontWeight: '800' },
});