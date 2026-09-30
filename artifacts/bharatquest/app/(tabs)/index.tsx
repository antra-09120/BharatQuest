import React, { useMemo } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetIndiaHeritage } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';
import {
  ActionButton,
  BrandHeader,
  EmptyState,
  Eyebrow,
  LoadingState,
  Pill,
  ProgressBar,
  Screen,
  SectionHeading,
  SiteCard,
} from '@/components/game-ui';

const LEVEL_XP = 500;

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { progress, level, levelProgress } = useGame();
  const heritage = useGetIndiaHeritage();
  const sites = heritage.data ?? [];
  const featured = sites.slice(0, 3);
  const today = new Date().toISOString().slice(0, 10);
  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const dailySite = useMemo(
    () => (sites.length ? sites[dayNumber % sites.length] : undefined),
    [sites, dayNumber],
  );
  const discoveries = progress.discoveredSiteIds.length;

  return (
    <Screen withTabs>
      <BrandHeader onSearch={() => router.push('/search')} />

      <View style={styles.welcome}>
        <View style={styles.welcomeText}>
          <Eyebrow>YOUR NEXT DISCOVERY AWAITS</Eyebrow>
          <Text style={[styles.greeting, { color: colors.foreground }]}>
            Namaste, {progress.displayName}
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            India's heritage is the game world.
          </Text>
        </View>
        {progress.demoMode ? <Pill tone="terracotta">DEMO MODE</Pill> : null}
      </View>

      <View style={[styles.levelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.levelTop}>
          <View style={[styles.levelSeal, { backgroundColor: colors.navy }]}>
            <Feather name="compass" size={19} color={colors.gold} />
          </View>
          <View style={styles.levelInfo}>
            <Text style={[styles.levelName, { color: colors.foreground }]}>
              Level {level} · Heritage Seeker
            </Text>
            <Text style={[styles.levelCaption, { color: colors.mutedForeground }]}>
              {levelProgress} / {LEVEL_XP} XP to next level
            </Text>
          </View>
          <View style={styles.xpPill}>
            <Text style={[styles.xpValue, { color: colors.terracotta }]}>
              {progress.xp}
            </Text>
            <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>XP</Text>
          </View>
        </View>
        <ProgressBar value={levelProgress} total={LEVEL_XP} />
        <View style={styles.levelFooter}>
          <Text style={[styles.streakText, { color: colors.mutedForeground }]}>
            {progress.streak > 0
              ? `${progress.streak} day${progress.streak === 1 ? '' : 's'} exploring`
              : 'Your first discovery starts a streak'}
          </Text>
          <Text style={[styles.streakText, { color: colors.mutedForeground }]}>
            {discoveries} discovered
          </Text>
        </View>
      </View>

      <ImageBackground
        source={require('../../assets/images/world-map-illustration.png')}
        imageStyle={styles.journeyImage}
        style={[styles.journeyCard, { backgroundColor: colors.navy }]}
      >
        <LinearGradient
          colors={[`${colors.navy}22`, `${colors.navy}F0`]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.journeyContent}>
          <Eyebrow>CONTINUE YOUR JOURNEY</Eyebrow>
          <Text style={[styles.journeyTitle, { color: colors.onDark }]}>
            The heritage trail
          </Text>
          <Text style={[styles.journeyCopy, { color: `${colors.onDark}D6` }]}>
            Find a real World Heritage Site. Its story is your next level.
          </Text>
          <Text style={[styles.journeySmall, { color: `${colors.onDark}B8` }]}>
            Conceptual artwork · site markers use UNESCO coordinates.
          </Text>
          <View style={styles.journeyProgress}>
            <ProgressBar value={discoveries} total={3} color={colors.gold} />
            <Text style={[styles.journeySmall, { color: `${colors.onDark}D6` }]}>
              {Math.min(discoveries, 3)} / 3 sites found
            </Text>
          </View>
          <ActionButton
            title="OPEN THE MAP"
            icon="map"
            onPress={() => router.push('/(tabs)/explore')}
            testID="continue-journey"
            compact
          />
        </View>
      </ImageBackground>

      <View style={[styles.dailyCard, { backgroundColor: colors.parchment, borderColor: colors.border }]}>
        <View style={styles.dailyTop}>
          <View style={{ flex: 1, gap: 5 }}>
            <Eyebrow>DAILY CHALLENGE</Eyebrow>
            <Text style={[styles.dailyTitle, { color: colors.foreground }]}>
              Name that category
            </Text>
            <Text style={[styles.dailyCopy, { color: colors.mutedForeground }]}>
              {dailySite
                ? `Can you match ${dailySite.name} to its UNESCO category?`
                : 'A source-backed UNESCO category challenge.'}
            </Text>
          </View>
          <View style={[styles.dailyIcon, { backgroundColor: colors.card }]}>
            <Feather name="target" size={20} color={colors.terracotta} />
          </View>
        </View>
        <View style={styles.dailyFooter}>
          <Text style={[styles.reward, { color: colors.terracotta }]}>
            +50 XP · {progress.dailyChallengeDate === today ? 'COMPLETED' : 'DAILY REWARD'}
          </Text>
          <ActionButton
            title={progress.dailyChallengeDate === today ? 'PLAY AGAIN' : 'PLAY'}
            icon="play"
            onPress={() => router.push({ pathname: '/game-match', params: { mode: 'daily', ...(dailySite ? { siteId: dailySite.id } : {}) } })}
            compact
            testID="daily-challenge"
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading
          title="Featured discoveries"
          action={
            <Pressable
              onPress={() => router.push('/(tabs)/explore')}
              accessibilityRole="button"
              testID="see-all-sites"
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={[styles.link, { color: colors.jade }]}>SEE ALL</Text>
            </Pressable>
          }
        />
        {heritage.isLoading ? (
          <LoadingState />
        ) : heritage.isError ? (
          <EmptyState
            title="Heritage data is temporarily unavailable"
            body="Please try again. BharatQuest will not replace source data with invented details."
            icon="wifi-off"
          />
        ) : featured.length ? (
          featured.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onPress={() => router.push({ pathname: '/heritage/[id]', params: { id: site.id } })}
            />
          ))
        ) : (
          <EmptyState
            title="No heritage records found"
            body="The UNESCO India dataset did not return any records."
          />
        )}
      </View>

      <View style={[styles.demoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.demoCopy}>
          <Pill tone={progress.demoMode ? 'terracotta' : 'jade'}>
            {progress.demoMode ? 'DEMO MODE ON' : 'PRESENTATION MODE'}
          </Pill>
          <Text style={[styles.demoTitle, { color: colors.foreground }]}>
            Walk the SIH demo path
          </Text>
          <Text style={[styles.dailyCopy, { color: colors.mutedForeground }]}>
            See the full journey from map discovery to source-backed gameplay.
          </Text>
        </View>
        <ActionButton
          title="GUIDED DEMO"
          icon="arrow-right"
          secondary
          onPress={() => router.push('/demo')}
          testID="guided-demo"
          compact
        />
      </View>
      {heritage.isError ? (
        <ActionButton
          title="TRY AGAIN"
          icon="refresh-cw"
          secondary
          onPress={() => void heritage.refetch()}
          testID="retry-heritage"
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcome: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  welcomeText: { flex: 1, gap: 5 },
  greeting: { fontFamily: 'Georgia', fontSize: 27, fontWeight: '700', marginTop: 2 },
  tagline: { fontSize: 12, lineHeight: 18 },
  levelCard: { padding: 17, borderRadius: 21, borderWidth: 1, gap: 14 },
  levelTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelSeal: { width: 43, height: 43, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  levelInfo: { flex: 1, gap: 5 },
  levelName: { fontSize: 13, fontWeight: '800' },
  levelCaption: { fontSize: 11 },
  xpPill: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  xpValue: { fontFamily: 'Georgia', fontSize: 23, fontWeight: '700' },
  xpLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  levelFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  streakText: { fontSize: 10, fontWeight: '600' },
  journeyCard: { minHeight: 292, borderRadius: 25, overflow: 'hidden', justifyContent: 'flex-end' },
  journeyImage: { opacity: 0.72 },
  journeyContent: { padding: 20, gap: 11 },
  journeyTitle: { fontFamily: 'Georgia', fontSize: 29, fontWeight: '700' },
  journeyCopy: { fontSize: 12, lineHeight: 18, maxWidth: 285 },
  journeyProgress: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  journeySmall: { fontSize: 10, fontWeight: '700' },
  dailyCard: { borderWidth: 1, borderRadius: 22, padding: 18, gap: 16 },
  dailyTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dailyTitle: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '700' },
  dailyCopy: { fontSize: 12, lineHeight: 18 },
  dailyIcon: { width: 47, height: 47, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dailyFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  reward: { fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  section: { gap: 14 },
  link: { fontSize: 10, fontWeight: '800', letterSpacing: 0.9, paddingVertical: 8 },
  demoCard: { borderRadius: 22, borderWidth: 1, padding: 17, gap: 14 },
  demoCopy: { gap: 10, alignItems: 'flex-start' },
  demoTitle: { fontFamily: 'Georgia', fontSize: 20, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});