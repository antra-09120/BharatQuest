import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Heading,
  IconButton,
  Pill,
  ProgressBar,
  Screen,
} from '@/components/game-ui';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';

const definitions = [
  { id: 'heritage-explorer', title: 'Heritage Explorer', description: 'Explore 5 heritage locations.', icon: 'compass' as const, current: 'discoveredSiteIds' as const, target: 5 },
  { id: 'map-master', title: 'Map Master', description: 'Complete 3 map challenges.', icon: 'map' as const, current: 'mapCorrectSiteIds' as const, target: 3 },
  { id: 'culture-hunter', title: 'Culture Hunter', description: 'Collect 10 culture cards.', icon: 'layers' as const, current: 'discoveredSiteIds' as const, target: 10 },
  { id: 'history-seeker', title: 'History Seeker', description: 'Complete 10 source-backed game challenges.', icon: 'book-open' as const, current: 'gameChallenges' as const, target: 10 },
];

export default function AchievementsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { progress } = useGame();

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" label="Back" onPress={() => router.back()} />
        <View style={styles.spacer} />
      </View>
      <Heading
        title="Achievement trail"
        subtitle="Badges measure game progress, not cultural or historical significance."
        eyebrow="FIELD HONOURS"
      />
      {definitions.map((item) => {
        const current =
          item.current === 'gameChallenges'
            ? progress.matchCorrectSiteIds.length + progress.mapCorrectSiteIds.length
            : progress[item.current].length;
        const earned = current >= item.target;
        return (
          <View key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.icon, { backgroundColor: earned ? colors.accent : colors.secondary }]}>
              <Feather name={earned ? 'award' : item.icon} size={22} color={earned ? colors.accentForeground : colors.terracotta} />
            </View>
            <View style={styles.copy}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: colors.foreground }]}>{item.title}</Text>
                {earned ? <Pill tone="jade">EARNED</Pill> : null}
              </View>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>{item.description}</Text>
              <View style={styles.progressRow}>
                <ProgressBar value={Math.min(current, item.target)} total={item.target} color={earned ? colors.jade : colors.primary} />
                <Text style={[styles.count, { color: colors.mutedForeground }]}>{Math.min(current, item.target)} / {item.target}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center' },
  spacer: { flex: 1 },
  card: { borderWidth: 1, borderRadius: 21, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 13 },
  icon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 8 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '700', flex: 1 },
  description: { fontSize: 11, lineHeight: 16 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  count: { width: 38, fontSize: 10, textAlign: 'right', fontWeight: '700' },
});