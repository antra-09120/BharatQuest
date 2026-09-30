import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BrandHeader, Heading, Pill, ProgressBar, Screen } from '@/components/game-ui';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';

const today = new Date().toISOString().slice(0, 10);

export default function MissionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { progress } = useGame();
  const missions = [
    {
      id: 'heritage-hunt',
      title: 'Heritage Hunt',
      category: 'EXPLORE',
      description: 'Discover three real UNESCO sites from India.',
      reward: 100,
      current: Math.min(progress.discoveredSiteIds.length, 3),
      target: 3,
      icon: 'compass' as const,
      href: '/(tabs)/explore' as const,
    },
    {
      id: 'culture-match',
      title: 'Culture Match',
      category: 'PLAY',
      description: 'Match three sites to their UNESCO-listed category.',
      reward: 100,
      current: Math.min(progress.matchCorrectSiteIds.length, 3),
      target: 3,
      icon: 'target' as const,
      href: '/game-match' as const,
    },
    {
      id: 'history-challenge',
      title: 'History Challenge',
      category: 'DAILY',
      description: 'Play today’s source-backed site category challenge.',
      reward: 50,
      current: progress.dailyChallengeDate === today ? 1 : 0,
      target: 1,
      icon: 'clock' as const,
      href: '/game-match' as const,
      params: { mode: 'daily' },
    },
    {
      id: 'map-explorer',
      title: 'Map Explorer',
      category: 'MAP',
      description: 'Place three sites using their listed coordinates.',
      reward: 100,
      current: Math.min(progress.mapCorrectSiteIds.length, 3),
      target: 3,
      icon: 'map' as const,
      href: '/game-map' as const,
    },
    {
      id: 'architecture-match',
      title: 'Architecture Match',
      category: 'COLLECT',
      description: 'Find five sites through UNESCO-listed image and category matches.',
      reward: 100,
      current: Math.min(progress.matchCorrectSiteIds.length, 5),
      target: 5,
      icon: 'image' as const,
      href: '/game-match' as const,
      params: { mode: 'identify-site' },
    },
  ];

  return (
    <Screen withTabs>
      <BrandHeader />
      <Heading
        title="Choose a mission"
        subtitle="Every challenge is built from records in the UNESCO World Heritage dataset."
        eyebrow="YOUR FIELD JOURNAL"
      />
      <View style={[styles.streakBanner, { backgroundColor: colors.navy }]}>
        <View style={[styles.streakIcon, { backgroundColor: `${colors.gold}25` }]}>
          <Feather name="activity" size={19} color={colors.gold} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.streakTitle, { color: colors.onDark }]}>
            {progress.streak > 0 ? `${progress.streak}-day exploration streak` : 'Start a new exploration streak'}
          </Text>
          <Text style={[styles.streakCopy, { color: `${colors.onDark}B8` }]}>
            Progress and rewards are saved on this device.
          </Text>
        </View>
      </View>
      {missions.map((mission) => {
        const completed =
          mission.id === 'history-challenge'
            ? progress.dailyChallengeDate === today
            : progress.completedMissionIds.includes(mission.id);
        const completeCount = Math.min(mission.current, mission.target);
        const startMission = () => {
          if (mission.params) {
            router.push({ pathname: mission.href, params: mission.params });
          } else {
            router.push(mission.href);
          }
        };
        return (
          <View
            key={mission.id}
            style={[
              styles.missionCard,
              { backgroundColor: colors.card, borderColor: completed ? colors.jade : colors.border },
            ]}
          >
            <View style={styles.missionTop}>
              <View style={[styles.missionIcon, { backgroundColor: completed ? colors.jade : colors.secondary }]}>
                <Feather name={completed ? 'check' : mission.icon} size={19} color={completed ? colors.onDark : colors.terracotta} />
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={[styles.missionTitle, { color: colors.foreground }]}>{mission.title}</Text>
                <Pill tone={completed ? 'jade' : 'saffron'}>{completed ? 'COMPLETED' : mission.category}</Pill>
              </View>
              <Text style={[styles.reward, { color: colors.terracotta }]}>+{mission.reward} XP</Text>
            </View>
            <Text style={[styles.missionDescription, { color: colors.mutedForeground }]}>{mission.description}</Text>
            <View style={styles.missionProgress}>
              <ProgressBar value={completeCount} total={mission.target} color={completed ? colors.jade : colors.primary} />
              <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
                {completeCount} / {mission.target}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              testID={`start-mission-${mission.id}`}
              onPress={startMission}
              style={({ pressed }) => [
                styles.startButton,
                {
                  backgroundColor: completed ? colors.secondary : colors.navy,
                  opacity: pressed ? 0.76 : 1,
                },
              ]}
            >
              <Text style={[styles.startText, { color: completed ? colors.secondaryForeground : colors.onDark }]}>
                {completed ? 'PLAY AGAIN' : 'START MISSION'}
              </Text>
              <Feather name="arrow-up-right" size={15} color={completed ? colors.secondaryForeground : colors.onDark} />
            </Pressable>
          </View>
        );
      })}
      <Text style={[styles.finePrint, { color: colors.mutedForeground }]}>
        XP and collection rarity are game values. Site facts and classifications come from UNESCO.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  streakBanner: { borderRadius: 21, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  streakTitle: { fontSize: 13, fontWeight: '800' },
  streakCopy: { fontSize: 10, lineHeight: 15 },
  missionCard: { borderRadius: 22, borderWidth: 1, padding: 17, gap: 13 },
  missionTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  missionIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  missionTitle: { fontFamily: 'Georgia', fontSize: 19, fontWeight: '700' },
  reward: { fontSize: 10, fontWeight: '900', letterSpacing: 0.45 },
  missionDescription: { fontSize: 12, lineHeight: 18 },
  missionProgress: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressText: { fontSize: 10, fontWeight: '700', width: 42, textAlign: 'right' },
  startButton: { minHeight: 43, borderRadius: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  startText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  finePrint: { fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: -5 },
});