import React, { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useGetIndiaHeritage,
  type HeritageSite,
} from '@workspace/api-client-react';
import {
  ActionButton,
  EmptyState,
  Heading,
  IconButton,
  LoadingState,
  Pill,
  ProgressBar,
  Screen,
  SiteArtwork,
  SourceLine,
} from '@/components/game-ui';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';

const EMPTY_SITES: HeritageSite[] = [];
const QUESTION_COUNT = 5;

export default function HeritageMatchScreen() {
  const colors = useColors();
  const router = useRouter();
  const { mode, siteId } = useLocalSearchParams<{ mode?: string; siteId?: string }>();
  const identifySite = mode === 'identify-site';
  const dailyChallenge = mode === 'daily';
  const categoryMatch = !identifySite;
  const heritage = useGetIndiaHeritage();
  const records = heritage.data ?? EMPTY_SITES;
  const pool = useMemo(
    () =>
      records.filter((site) =>
        identifySite
          ? Boolean(site.imageUrl)
          : ['Cultural', 'Natural', 'Mixed'].includes(site.category ?? ''),
      ),
    [records, identifySite],
  );
  const orderedSites = useMemo(() => {
    if (!siteId) return pool;
    const selected = pool.find((site) => site.id === siteId);
    return selected
      ? [selected, ...pool.filter((site) => site.id !== siteId)]
      : pool;
  }, [pool, siteId]);
  const questionTotal = dailyChallenge ? 1 : QUESTION_COUNT;
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const { progress, recordCorrectMatch, completeDailyChallenge } = useGame();
  const finished = round >= questionTotal;
  const site = orderedSites.length
    ? orderedSites[round % orderedSites.length]
    : undefined;

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(
          pool
            .map((item) => item.category)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort(),
    [pool],
  );

  const options = useMemo(() => {
    if (!site) return [];
    if (categoryMatch) return categoryOptions;
    const distractors = orderedSites
      .filter((item) => item.id !== site.id)
      .slice(0, 3)
      .map((item) => item.name);
    return [...new Set([site.name, ...distractors])].sort((left, right) =>
      left.localeCompare(right),
    );
  }, [site, categoryMatch, categoryOptions, orderedSites]);

  const answerKey = site
    ? categoryMatch
      ? site.category ?? ''
      : site.name
    : '';
  const alreadyCompletedDaily =
    progress.dailyChallengeDate === new Date().toISOString().slice(0, 10);

  const selectAnswer = (choice: string) => {
    if (!site || answer !== null) return;
    setAnswer(choice);
    if (choice === answerKey) {
      setScore((value) => value + 1);
      recordCorrectMatch(site.id, dailyChallenge ? 0 : 50);
      if (dailyChallenge && !alreadyCompletedDaily) completeDailyChallenge();
    }
  };

  const continueGame = () => {
    setRound((value) => value + 1);
    setAnswer(null);
  };

  const replay = () => {
    setRound(0);
    setAnswer(null);
    setScore(0);
  };

  const openSource = async () => {
    try {
      await Linking.openURL(site?.sourceUrl ?? 'https://data.unesco.org/explore/dataset/whc001/');
    } catch {
      // Source remains identified in the game if no browser can be opened.
    }
  };

  if (heritage.isLoading) {
    return (
      <Screen>
        <LoadingState message="Preparing source-backed questions…" />
      </Screen>
    );
  }
  if (heritage.isError) {
    return (
      <Screen>
        <EmptyState
          title="The game needs UNESCO data"
          body="Heritage data is temporarily unavailable. Please try again."
          icon="wifi-off"
        />
        <ActionButton title="GO BACK" icon="arrow-left" secondary onPress={() => router.back()} />
      </Screen>
    );
  }
  if (!orderedSites.length) {
    return (
      <Screen>
        <EmptyState
          title={identifySite ? 'No UNESCO-listed images are available' : 'No category records are available'}
          body="The game will not invent a question when a source field is missing."
          icon="image"
        />
        <ActionButton title="GO BACK" icon="arrow-left" secondary onPress={() => router.back()} />
      </Screen>
    );
  }
  if (!site) {
    return (
      <Screen>
        <EmptyState
          title="The next question is unavailable"
          body="This round has no valid UNESCO record to use."
          icon="info"
        />
        <ActionButton title="GO BACK" icon="arrow-left" secondary onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" label="Exit game" onPress={() => router.back()} testID="match-back" />
        <Pill tone={dailyChallenge ? 'terracotta' : 'saffron'}>
          {dailyChallenge ? 'DAILY CHALLENGE' : identifySite ? 'IMAGE MATCH' : 'CULTURE MATCH'}
        </Pill>
        <View style={styles.scoreTag}>
          <Feather name="zap" size={13} color={colors.terracotta} />
          <Text style={[styles.scoreText, { color: colors.foreground }]}>{score} / {questionTotal}</Text>
        </View>
      </View>

      {finished ? (
        <View style={[styles.finishCard, { backgroundColor: colors.navy }]}>
          <View style={[styles.finishSeal, { backgroundColor: colors.gold }]}>
            <Feather name={score > 0 ? 'award' : 'refresh-cw'} size={28} color={colors.navy} />
          </View>
          <Pill tone="saffron">ROUND COMPLETE</Pill>
          <Text style={[styles.finishTitle, { color: colors.onDark }]}>
            {score > 0 ? 'Good work, explorer.' : 'The trail is still open.'}
          </Text>
          <Text style={[styles.finishCopy, { color: `${colors.onDark}C7` }]}>
            {dailyChallenge
              ? alreadyCompletedDaily
                ? 'The daily reward has already been collected today.'
                : score > 0
                  ? 'You earned the daily challenge reward. Come back tomorrow for a new one.'
                  : 'Answer correctly to collect today’s 50 XP reward. You can try again.'
              : `${score} of ${questionTotal} correct. A site match pays game XP only once for each UNESCO record.`}
          </Text>
          <View style={styles.finishActions}>
            <ActionButton title="PLAY AGAIN" icon="refresh-cw" onPress={replay} testID="match-replay" />
            <ActionButton title="DONE" icon="check" secondary onPress={() => router.back()} />
          </View>
        </View>
      ) : (
        <>
          <Heading
            title={dailyChallenge ? 'Daily challenge' : 'Heritage match'}
            subtitle={
              dailyChallenge
                ? 'One source-backed UNESCO category question each day.'
                : identifySite
                  ? 'Match a UNESCO-listed site image to its record.'
                  : 'Match each site to the category recorded by UNESCO.'
            }
            eyebrow={dailyChallenge ? 'ONE QUESTION · 50 XP' : `QUESTION ${round + 1} OF ${questionTotal}`}
          />
          <View style={styles.questionProgress}>
            <ProgressBar value={round} total={questionTotal} />
            <Text style={[styles.questionIndex, { color: colors.mutedForeground }]}>{round + 1} / {questionTotal}</Text>
          </View>
          {identifySite && site.imageUrl ? (
            <SiteArtwork site={site} height={218} showBadge={false} />
          ) : (
            <View style={[styles.questionArt, { backgroundColor: colors.mapWater, borderColor: colors.border }]}>
              <Feather name="compass" size={38} color={colors.jade} />
              <Pill tone="jade">UNESCO WORLD HERITAGE</Pill>
            </View>
          )}
          <View style={styles.questionCopy}>
            <Text style={[styles.questionLabel, { color: colors.terracotta }]}>
              {identifySite ? 'WHICH SITE IS SHOWN?' : 'WHAT IS ITS UNESCO CATEGORY?'}
            </Text>
            <Text style={[styles.questionName, { color: colors.foreground }]}>
              {identifySite ? 'Identify this heritage image' : site.name}
            </Text>
            {categoryMatch && site.shortDescription ? (
              <Text style={[styles.questionDescription, { color: colors.mutedForeground }]} numberOfLines={3}>
                {site.shortDescription}
              </Text>
            ) : null}
            {identifySite && site.imageCaption ? (
              <Text style={[styles.questionDescription, { color: colors.mutedForeground }]} numberOfLines={2}>
                {site.imageCaption}
              </Text>
            ) : null}
          </View>
          <SourceLine sourceName={site.sourceName} onPress={() => void openSource()} />

          <View style={styles.answerOptions}>
            {options.map((option, index) => {
              const isRight = answer !== null && option === answerKey;
              const isWrong = answer === option && option !== answerKey;
              const backgroundColor = isRight
                ? colors.jade
                : isWrong
                  ? colors.destructive
                  : colors.card;
              const textColor = isRight || isWrong ? colors.onDark : colors.foreground;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: answer !== null }}
                  testID={`match-option-${index + 1}`}
                  disabled={answer !== null}
                  onPress={() => selectAnswer(option)}
                  style={({ pressed }) => [
                    styles.answerOption,
                    {
                      backgroundColor,
                      borderColor: isRight ? colors.jade : isWrong ? colors.destructive : colors.border,
                      opacity: pressed ? 0.75 : 1,
                    },
                  ]}
                >
                  <View style={[styles.optionNumber, { backgroundColor: isRight || isWrong ? `${colors.onDark}24` : colors.secondary }]}>
                    <Text style={[styles.optionNumberText, { color: isRight || isWrong ? colors.onDark : colors.mutedForeground }]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                  {isRight ? <Feather name="check" size={18} color={colors.onDark} /> : null}
                  {isWrong ? <Feather name="x" size={18} color={colors.onDark} /> : null}
                </Pressable>
              );
            })}
          </View>

          {answer !== null ? (
            <View style={[styles.feedback, { backgroundColor: answer === answerKey ? colors.accent : colors.parchment }]}>
              <Text style={[styles.feedbackTitle, { color: colors.foreground }]}>
                {answer === answerKey ? 'That is the UNESCO record.' : `UNESCO lists this as ${answerKey}.`}
              </Text>
              <Text style={[styles.feedbackBody, { color: colors.secondaryForeground }]}>
                {categoryMatch
                  ? site.shortDescription ?? 'No additional site description is available in this record.'
                  : site.imageCaption ?? 'The image is listed with this site in UNESCO’s dataset.'}
              </Text>
              <ActionButton
                title={round === questionTotal - 1 ? 'SEE RESULTS' : 'NEXT QUESTION'}
                icon="arrow-right"
                onPress={continueGame}
                testID="match-next"
              />
            </View>
          ) : (
            <Text style={[styles.gameNote, { color: colors.mutedForeground }]}>
              {dailyChallenge
                ? 'A correct answer earns today’s reward once. Site facts stay linked to UNESCO.'
                : 'Correct matches earn 50 game XP once per site. No facts are generated for the game.'}
            </Text>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9 },
  scoreTag: { minWidth: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5 },
  scoreText: { fontSize: 11, fontWeight: '800' },
  questionProgress: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  questionIndex: { width: 37, textAlign: 'right', fontSize: 10, fontWeight: '700' },
  questionArt: { minHeight: 162, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 11 },
  questionCopy: { gap: 6 },
  questionLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  questionName: { fontFamily: 'Georgia', fontSize: 24, lineHeight: 29, fontWeight: '700' },
  questionDescription: { fontSize: 11, lineHeight: 17 },
  answerOptions: { gap: 8 },
  answerOption: { minHeight: 53, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionNumber: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  optionNumberText: { fontSize: 10, fontWeight: '900' },
  optionText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '700' },
  feedback: { borderRadius: 18, padding: 15, gap: 9 },
  feedbackTitle: { fontSize: 13, fontWeight: '900' },
  feedbackBody: { fontSize: 11, lineHeight: 17 },
  gameNote: { fontSize: 10, lineHeight: 16, textAlign: 'center' },
  finishCard: { flex: 1, minHeight: 410, borderRadius: 27, padding: 23, justifyContent: 'center', alignItems: 'center', gap: 15 },
  finishSeal: { width: 68, height: 68, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  finishTitle: { fontFamily: 'Georgia', fontSize: 29, lineHeight: 35, fontWeight: '700', textAlign: 'center' },
  finishCopy: { fontSize: 12, lineHeight: 19, textAlign: 'center' },
  finishActions: { width: '100%', gap: 9, marginTop: 4 },
});