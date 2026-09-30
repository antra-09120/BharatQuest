import React, { useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetIndiaHeritage, type HeritageSite } from '@workspace/api-client-react';
import { IndiaMap, mapQuadrant } from '@/components/IndiaMap';
import {
  ActionButton,
  EmptyState,
  Heading,
  IconButton,
  LoadingState,
  Pill,
  ProgressBar,
  Screen,
  SourceLine,
} from '@/components/game-ui';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';

const EMPTY_SITES: HeritageSite[] = [];
const OPTIONS = ['North-West', 'North-East', 'South-West', 'South-East'];
const QUESTION_COUNT = 5;

export default function MapChallengeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { siteId } = useLocalSearchParams<{ siteId?: string }>();
  const heritage = useGetIndiaHeritage();
  const records = heritage.data ?? EMPTY_SITES;
  const sites = useMemo(
    () => records.filter((site) => site.latitude != null && site.longitude != null),
    [records],
  );
  const orderedSites = useMemo(() => {
    if (!siteId) return sites;
    const selected = sites.find((site) => site.id === siteId);
    return selected ? [selected, ...sites.filter((site) => site.id !== siteId)] : sites;
  }, [sites, siteId]);
  const { recordCorrectMapChallenge } = useGame();
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const finished = round >= QUESTION_COUNT;
  const site = orderedSites.length ? orderedSites[round % orderedSites.length] : undefined;
  const expected = site ? mapQuadrant(site, records) : null;
  const selectedCorrect = answer !== null && answer === expected;

  const selectAnswer = (choice: string) => {
    if (answer !== null || !site || !expected) return;
    setAnswer(choice);
    if (choice === expected) {
      setScore((value) => value + 1);
      recordCorrectMapChallenge(site.id);
    }
  };

  const openSource = async () => {
    if (!site) return;
    try {
      await Linking.openURL(site.sourceUrl);
    } catch {
      // Attribution remains visible if the device cannot open a browser.
    }
  };

  if (heritage.isLoading) {
    return (
      <Screen>
        <LoadingState message="Loading UNESCO site coordinates…" />
      </Screen>
    );
  }
  if (heritage.isError) {
    return (
      <Screen>
        <EmptyState
          title="Map challenge unavailable"
          body="UNESCO coordinates are temporarily unavailable. Try again later."
          icon="wifi-off"
        />
        <ActionButton title="GO BACK" icon="arrow-left" secondary onPress={() => router.back()} />
      </Screen>
    );
  }
  if (!sites.length) {
    return (
      <Screen>
        <EmptyState
          title="No UNESCO coordinates are available"
          body="The map challenge needs source-provided coordinates and will not invent a location."
          icon="map"
        />
        <ActionButton title="GO BACK" icon="arrow-left" secondary onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" label="Exit map challenge" onPress={() => router.back()} testID="map-game-back" />
        <Pill tone="jade">MAP EXPLORER</Pill>
        <Text style={[styles.score, { color: colors.foreground }]}>{score} / {QUESTION_COUNT}</Text>
      </View>
      {finished ? (
        <View style={[styles.finishCard, { backgroundColor: colors.navy }]}>
          <Pill tone="saffron">ROUTE COMPLETE</Pill>
          <Text style={[styles.finishTitle, { color: colors.onDark }]}>
            {score > 0 ? 'You found your way.' : 'Keep exploring the atlas.'}
          </Text>
          <Text style={[styles.finishCopy, { color: `${colors.onDark}C5` }]}>
            {score} of {QUESTION_COUNT} answers were correct. Each site can award map XP only once.
          </Text>
          <ActionButton title="PLAY AGAIN" icon="refresh-cw" onPress={() => { setRound(0); setAnswer(null); setScore(0); }} />
          <ActionButton title="DONE" icon="check" secondary onPress={() => router.back()} />
        </View>
      ) : (
        <>
          <Heading
            title="Place the site"
            subtitle="Choose the map quadrant that matches the site’s UNESCO-listed coordinates."
            eyebrow={`MAP CHALLENGE · ${round + 1} OF ${QUESTION_COUNT}`}
          />
          <ProgressBar value={round} total={QUESTION_COUNT} />
          <View style={styles.mapWrap}>
            <IndiaMap sites={records} showMarkers={false} />
          </View>
          <View style={[styles.sitePrompt, { backgroundColor: colors.parchment }]}>
            <Text style={[styles.promptLabel, { color: colors.terracotta }]}>FIND THIS UNESCO SITE</Text>
            <Text style={[styles.siteName, { color: colors.foreground }]}>{site?.name}</Text>
            <Text style={[styles.promptMeta, { color: colors.mutedForeground }]}>
              {site?.category ?? 'Category unavailable'}
              {site?.yearInscribed ? ` · ${site.yearInscribed}` : ''}
            </Text>
          </View>
          <View style={styles.options}>
            {OPTIONS.map((option, index) => {
              const isRight = answer !== null && option === expected;
              const isWrong = answer === option && option !== expected;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: answer !== null }}
                  testID={`map-quadrant-${index + 1}`}
                  disabled={answer !== null}
                  onPress={() => selectAnswer(option)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor: isRight ? colors.jade : isWrong ? colors.destructive : colors.card,
                      borderColor: isRight ? colors.jade : isWrong ? colors.destructive : colors.border,
                      opacity: pressed ? 0.72 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.optionDirection, { color: isRight || isWrong ? colors.onDark : colors.mutedForeground }]}>
                    {option.startsWith('North') ? 'N' : 'S'}{option.endsWith('West') ? 'W' : 'E'}
                  </Text>
                  <Text style={[styles.optionText, { color: isRight || isWrong ? colors.onDark : colors.foreground }]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {answer !== null && site ? (
            <View style={[styles.feedback, { backgroundColor: selectedCorrect ? colors.accent : colors.parchment }]}>
              <Text style={[styles.feedbackTitle, { color: colors.foreground }]}>
                {selectedCorrect ? 'Correct quadrant.' : `This record plots in ${expected}.`}
              </Text>
              <Text style={[styles.feedbackText, { color: colors.secondaryForeground }]}>
                {site.latitude != null && site.longitude != null
                  ? `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)} · coordinates from the UNESCO record. Quadrants use the midpoint of available India-site coordinates.`
                  : 'Coordinates are unavailable in this record.'}
              </Text>
              <SourceLine sourceName={site.sourceName} onPress={() => void openSource()} />
              <ActionButton
                title={round === QUESTION_COUNT - 1 ? 'SEE RESULTS' : 'NEXT SITE'}
                icon="arrow-right"
                onPress={() => { setRound((value) => value + 1); setAnswer(null); }}
                testID="map-next"
              />
            </View>
          ) : (
            <Text style={[styles.mapNote, { color: colors.mutedForeground }]}>
              The outline is schematic. Quadrant answers are calculated from coordinates in the current UNESCO India dataset.
            </Text>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  score: { fontSize: 11, fontWeight: '800' },
  mapWrap: { overflow: 'hidden', borderRadius: 24 },
  sitePrompt: { borderRadius: 18, padding: 16, gap: 6 },
  promptLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  siteName: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '700' },
  promptMeta: { fontSize: 10, fontWeight: '600' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  option: { width: '48%', minHeight: 64, borderWidth: 1, borderRadius: 17, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  optionDirection: { width: 25, height: 25, borderRadius: 9, textAlign: 'center', textAlignVertical: 'center', fontSize: 9, fontWeight: '900', overflow: 'hidden' },
  optionText: { fontSize: 10, fontWeight: '800', flex: 1 },
  feedback: { borderRadius: 18, padding: 15, gap: 9 },
  feedbackTitle: { fontSize: 13, fontWeight: '900' },
  feedbackText: { fontSize: 10, lineHeight: 16 },
  mapNote: { fontSize: 10, lineHeight: 16, textAlign: 'center' },
  finishCard: { flex: 1, minHeight: 350, padding: 23, borderRadius: 25, justifyContent: 'center', alignItems: 'center', gap: 15 },
  finishTitle: { fontFamily: 'Georgia', fontSize: 28, fontWeight: '700', textAlign: 'center' },
  finishCopy: { fontSize: 12, lineHeight: 19, textAlign: 'center' },
});