import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useGetIndiaHeritage } from '@workspace/api-client-react';
import { ActionButton, Heading, IconButton, Pill, ProgressBar, Screen } from '@/components/game-ui';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';

interface DemoStep {
  title: string;
  hint: string;
  route: (firstSiteId?: string) => Href;
  button: string;
}

const steps: DemoStep[] = [
  { title: 'Open Home', hint: 'Start at the explorer dashboard.', route: () => '/(tabs)', button: 'OPEN HOME' },
  { title: 'Tap Explore', hint: 'Open the schematic India atlas.', route: () => '/(tabs)/explore', button: 'OPEN EXPLORE' },
  { title: 'Select a real UNESCO site', hint: 'Tap a marker or a site in the list.', route: () => '/(tabs)/explore', button: 'SELECT A SITE' },
  { title: 'Read its sourced information', hint: 'Open a site story and check its attribution.', route: (id) => id ? ({ pathname: '/heritage/[id]', params: { id } }) : '/(tabs)/explore', button: 'OPEN A STORY' },
  { title: 'Start a mission', hint: 'Choose a source-backed challenge.', route: () => '/(tabs)/missions', button: 'VIEW MISSIONS' },
  { title: 'Play a mini-game', hint: 'Match a site to its documented UNESCO category.', route: () => '/game-match', button: 'PLAY HERITAGE MATCH' },
  { title: 'Earn XP', hint: 'Answer correctly to earn game XP once per site.', route: () => '/game-map', button: 'PLAY MAP CHALLENGE' },
  { title: 'Unlock a Culture Card', hint: 'Discover sites and complete missions to expand your vault.', route: () => '/(tabs)/collection', button: 'OPEN COLLECTION' },
  { title: 'Show your collection', hint: 'View discovered cards and their game-only metadata.', route: () => '/(tabs)/collection', button: 'VIEW CARDS' },
  { title: 'Show Data Sources', hint: 'Finish with the active UNESCO source and attribution policy.', route: () => '/data-sources', button: 'VIEW SOURCES' },
];

export default function DemoScreen() {
  const colors = useColors();
  const router = useRouter();
  const { progress, setDemoMode } = useGame();
  const heritage = useGetIndiaHeritage();
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const firstSite = heritage.data?.[0];

  const openCurrent = () => {
    setDemoMode(true);
    router.push(step.route(firstSite?.id));
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" label="Back" onPress={() => router.back()} />
        <Pill tone="terracotta">SIH DEMO</Pill>
      </View>
      <Heading
        title="The BharatQuest demo"
        subtitle="A guided path through the live prototype. Visit each stop, then return here for the next one."
        eyebrow="PRESENTATION MODE"
      />
      <View style={[styles.demoCard, { backgroundColor: colors.navy }]}>
        <View style={styles.demoTop}>
          <View style={[styles.number, { backgroundColor: colors.gold }]}>
            <Text style={[styles.numberText, { color: colors.navy }]}>{String(stepIndex + 1).padStart(2, '0')}</Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.stepLabel, { color: colors.gold }]}>GUIDED PATH · STEP {stepIndex + 1} OF {steps.length}</Text>
            <Text style={[styles.stepTitle, { color: colors.onDark }]}>{step.title}</Text>
          </View>
        </View>
        <Text style={[styles.stepHint, { color: `${colors.onDark}C6` }]}>{step.hint}</Text>
        <ProgressBar value={stepIndex + 1} total={steps.length} color={colors.gold} />
        <ActionButton
          title={step.button}
          icon="arrow-right"
          onPress={openCurrent}
          testID="demo-open-step"
        />
        <Text style={[styles.returnHint, { color: `${colors.onDark}A8` }]}>
          Return to this guide when you have completed this stop.
        </Text>
      </View>
      <View style={styles.steps}>
        {steps.map((item, index) => {
          const active = index === stepIndex;
          const passed = index < stepIndex;
          return (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              testID={`demo-step-${index + 1}`}
              onPress={() => setStepIndex(index)}
              style={({ pressed }) => [
                styles.stepRow,
                {
                  backgroundColor: active ? colors.accent : colors.card,
                  borderColor: active ? colors.saffron : colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Feather name={passed ? 'check-circle' : active ? 'play-circle' : 'circle'} size={18} color={passed ? colors.jade : active ? colors.terracotta : colors.mutedForeground} />
              <Text style={[styles.stepRowText, { color: colors.foreground }]}>{index + 1}. {item.title}</Text>
              {active ? <Feather name="arrow-right" size={14} color={colors.terracotta} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.navigation}>
        <ActionButton
          title="PREVIOUS"
          icon="arrow-left"
          secondary
          disabled={stepIndex === 0}
          onPress={() => setStepIndex((value) => Math.max(0, value - 1))}
        />
        <ActionButton
          title={stepIndex === steps.length - 1 ? 'FINISH DEMO' : 'NEXT STEP'}
          icon={stepIndex === steps.length - 1 ? 'check' : 'arrow-right'}
          onPress={() => {
            if (stepIndex === steps.length - 1) {
              setDemoMode(false);
              router.replace('/(tabs)');
            } else {
              setStepIndex((value) => value + 1);
            }
          }}
          testID="demo-next-step"
        />
      </View>
      {progress.demoMode ? (
        <Text style={[styles.activeNote, { color: colors.terracotta }]}>Demo indicators are on in the app.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  demoCard: { padding: 19, borderRadius: 24, gap: 15 },
  demoTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  number: { width: 47, height: 47, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '700' },
  stepLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1.1 },
  stepTitle: { fontFamily: 'Georgia', fontSize: 21, fontWeight: '700' },
  stepHint: { fontSize: 12, lineHeight: 18 },
  returnHint: { fontSize: 9, lineHeight: 14, textAlign: 'center' },
  steps: { gap: 7 },
  stepRow: { minHeight: 43, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepRowText: { flex: 1, fontSize: 10, fontWeight: '700' },
  navigation: { flexDirection: 'row', gap: 9 },
  activeNote: { fontSize: 10, textAlign: 'center', fontWeight: '700' },
});