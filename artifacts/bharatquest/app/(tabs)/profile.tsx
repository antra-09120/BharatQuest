import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetIndiaHeritage } from '@workspace/api-client-react';
import {
  ActionButton,
  BrandHeader,
  Heading,
  Metric,
  Pill,
  ProgressBar,
  Screen,
  SectionHeading,
} from '@/components/game-ui';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';

const achievements = [
  { id: 'heritage-explorer', title: 'Heritage Explorer', caption: 'Explore 5 heritage locations', icon: 'compass' as const, current: (p: { discoveredSiteIds: string[] }) => p.discoveredSiteIds.length, total: 5 },
  { id: 'map-master', title: 'Map Master', caption: 'Complete 3 map challenges', icon: 'map' as const, current: (p: { mapCorrectSiteIds: string[] }) => p.mapCorrectSiteIds.length, total: 3 },
  { id: 'culture-hunter', title: 'Culture Hunter', caption: 'Collect 10 culture cards', icon: 'layers' as const, current: (p: { discoveredSiteIds: string[] }) => p.discoveredSiteIds.length, total: 10 },
  { id: 'history-seeker', title: 'History Seeker', caption: 'Complete 10 source-backed game challenges', icon: 'book-open' as const, current: (p: { matchCorrectSiteIds: string[]; mapCorrectSiteIds: string[] }) => p.matchCorrectSiteIds.length + p.mapCorrectSiteIds.length, total: 10 },
];

const futureScope = [
  'AR Heritage Hunt',
  'Multiplayer Cultural Challenges',
  'Regional Languages',
  'Traditional Indian Games',
  'School / Teacher Mode',
  'Museum Mode',
  'Location-based Missions',
  'Community-created challenges with moderation',
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { progress, level, levelProgress, setDisplayName, setRemindersEnabled, setDemoMode } = useGame();
  const heritage = useGetIndiaHeritage();
  const [draftName, setDraftName] = useState<string | null>(null);

  return (
    <Screen withTabs>
      <BrandHeader />
      <Heading
        title="Your field profile"
        subtitle="A record of the places you have found and the paths you have played."
        eyebrow="EXPLORER PROFILE"
      />
      <View style={[styles.profileCard, { backgroundColor: colors.navy }]}>
        <View style={[styles.avatar, { backgroundColor: colors.gold }]}>
          <Feather name="compass" size={23} color={colors.navy} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.profileLabel, { color: `${colors.onDark}B8` }]}>LEVEL {level} EXPLORER</Text>
          <Text style={[styles.profileName, { color: colors.onDark }]}>{progress.displayName}</Text>
          <Text style={[styles.profileXp, { color: colors.gold }]}>{progress.xp} XP EARNED</Text>
        </View>
        {progress.demoMode ? <Pill tone="terracotta">DEMO</Pill> : null}
      </View>
      <View style={styles.metrics}>
        <Metric value={level} label="Level" />
        <Metric value={progress.completedMissionIds.length} label="Missions" />
        <Metric value={progress.discoveredSiteIds.length} label="Sites found" />
      </View>
      <View style={styles.levelProgress}>
        <View style={styles.progressHeading}>
          <Text style={[styles.progressTitle, { color: colors.foreground }]}>Next level</Text>
          <Text style={[styles.progressSmall, { color: colors.mutedForeground }]}>{levelProgress} / 500 XP</Text>
        </View>
        <ProgressBar value={levelProgress} total={500} />
      </View>

      <View style={styles.section}>
        <SectionHeading title="Explorer settings" />
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.settingLabel, { color: colors.mutedForeground }]}>EXPLORER NAME</Text>
          <TextInput
            value={draftName ?? progress.displayName}
            onChangeText={setDraftName}
            onEndEditing={() => setDisplayName(draftName ?? progress.displayName)}
            onSubmitEditing={() => setDisplayName(draftName ?? progress.displayName)}
            returnKeyType="done"
            maxLength={32}
            testID="explorer-name"
            accessibilityLabel="Explorer name"
            placeholder="Explorer"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.nameInput, { color: colors.foreground, borderColor: colors.input }]}
          />
          <View style={[styles.settingRow, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>Interface language</Text>
              <Text style={[styles.settingCaption, { color: colors.mutedForeground }]}>
                English · Regional languages are in Future Scope
              </Text>
            </View>
          </View>
          <View style={[styles.settingRow, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>Daily reminder preference</Text>
              <Text style={[styles.settingCaption, { color: colors.mutedForeground }]}>
                Saved on this device; push notifications are not enabled.
              </Text>
            </View>
            <Switch
              value={progress.remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: colors.border, true: colors.jade }}
              thumbColor={colors.card}
              accessibilityLabel="Daily reminder preference"
              testID="reminders-toggle"
            />
          </View>
          <View style={[styles.settingRow, { borderTopColor: colors.border }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>Near Me</Text>
              <Text style={[styles.settingCaption, { color: colors.mutedForeground }]}>
                Location is requested only when you tap the map control.
              </Text>
            </View>
            <Feather name="map-pin" size={18} color={colors.jade} />
          </View>
          <Pressable
            accessibilityRole="button"
            testID="profile-data-sources"
            onPress={() => router.push('/data-sources')}
            style={({ pressed }) => [styles.settingRow, { borderTopColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>Data sources</Text>
              <Text style={[styles.settingCaption, { color: colors.mutedForeground }]}>See where each heritage record comes from.</Text>
            </View>
            <Feather name="external-link" size={17} color={colors.jade} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/achievements')}
            style={({ pressed }) => [styles.settingRow, { borderTopColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.settingTitle, { color: colors.foreground }]}>Achievements</Text>
              <Text style={[styles.settingCaption, { color: colors.mutedForeground }]}>Four game badges and their progress.</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading title="Badges" />
        <View style={styles.badges}>
          {achievements.map((item) => {
            const current = item.current(progress);
            const earned = current >= item.total;
            return (
              <View key={item.id} style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.border, opacity: earned ? 1 : 0.76 }]}>
                <View style={[styles.badgeIcon, { backgroundColor: earned ? colors.accent : colors.muted }]}>
                  <Feather name={earned ? 'award' : item.icon} size={17} color={earned ? colors.accentForeground : colors.mutedForeground} />
                </View>
                <Text style={[styles.badgeTitle, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[styles.badgeProgress, { color: colors.mutedForeground }]}>{Math.min(current, item.total)} / {item.total}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading title="Coming soon" />
        <View style={styles.futureTags}>
          {futureScope.map((feature) => (
            <View key={feature} style={[styles.futureTag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.futureText, { color: colors.secondaryForeground }]}>{feature}</Text>
              <Text style={[styles.comingSoon, { color: colors.terracotta }]}>COMING SOON</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading title="Demo mode" />
        <View style={[styles.demoSettings, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.settingCaption, { color: colors.mutedForeground }]}>
            Presentation markers for the guided SIH walkthrough.
          </Text>
          <ActionButton
            title={progress.demoMode ? 'TURN DEMO MODE OFF' : 'TURN DEMO MODE ON'}
            icon={progress.demoMode ? 'eye-off' : 'eye'}
            secondary
            onPress={() => setDemoMode(!progress.demoMode)}
            testID="toggle-demo-mode"
          />
          <ActionButton
            title="ABOUT BHARATQUEST"
            icon="info"
            secondary
            onPress={() => router.push('/data-sources')}
          />
        </View>
      </View>
      <Text style={[styles.dataFootnote, { color: colors.mutedForeground }]}>
        {heritage.data ? `${heritage.data.length} UNESCO records currently available.` : 'Heritage records load from the UNESCO data service.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { borderRadius: 24, padding: 19, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 53, height: 53, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  profileLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  profileName: { fontFamily: 'Georgia', fontSize: 24, fontWeight: '700', marginTop: 3 },
  profileXp: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8, marginTop: 5 },
  metrics: { flexDirection: 'row', gap: 9 },
  levelProgress: { gap: 10, marginTop: -6 },
  progressHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTitle: { fontSize: 12, fontWeight: '800' },
  progressSmall: { fontSize: 10, fontWeight: '600' },
  section: { gap: 13 },
  settingsCard: { borderRadius: 22, borderWidth: 1, paddingHorizontal: 16 },
  settingLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginTop: 16 },
  nameInput: { minHeight: 43, borderBottomWidth: 1, fontSize: 15, fontWeight: '700', paddingVertical: 8 },
  settingRow: { minHeight: 69, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  settingTitle: { fontSize: 12, fontWeight: '800' },
  settingCaption: { fontSize: 10, lineHeight: 15 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  badge: { width: '48%', minHeight: 124, borderRadius: 18, borderWidth: 1, padding: 12, gap: 7 },
  badgeIcon: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeTitle: { fontSize: 11, fontWeight: '800' },
  badgeProgress: { fontSize: 10 },
  futureTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  futureTag: { borderRadius: 13, paddingHorizontal: 11, paddingVertical: 10, gap: 4, maxWidth: '100%' },
  futureText: { fontSize: 10, fontWeight: '700' },
  comingSoon: { fontSize: 7, fontWeight: '900', letterSpacing: 0.8 },
  demoSettings: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 11 },
  dataFootnote: { fontSize: 10, textAlign: 'center', marginTop: -8 },
});