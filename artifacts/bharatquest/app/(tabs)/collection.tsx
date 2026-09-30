import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetIndiaHeritage, type HeritageSite } from '@workspace/api-client-react';
import {
  ActionButton,
  BrandHeader,
  EmptyState,
  Heading,
  LoadingState,
  Pill,
  Screen,
  SiteCard,
} from '@/components/game-ui';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';

const rarityNames = ['Common', 'Rare', 'Epic', 'Legendary'];

function rarityFor(site: HeritageSite): string {
  const numericId = Number.parseInt(site.id, 10);
  const index = Number.isFinite(numericId) ? Math.abs(numericId) % rarityNames.length : 0;
  return rarityNames[index];
}

export default function CollectionScreen() {
  const colors = useColors();
  const router = useRouter();
  const { progress } = useGame();
  const heritage = useGetIndiaHeritage();
  const sites = heritage.data ?? [];
  const discovered = sites.filter((site) => progress.discoveredSiteIds.includes(site.id));
  const vaultUnlocked = progress.completedMissionIds.length >= 3;

  return (
    <Screen withTabs>
      <BrandHeader />
      <Heading
        title="My collection"
        subtitle="Collect stories from across India, one source-backed discovery at a time."
        eyebrow="YOUR FIELD ARCHIVE"
      />
      <View style={[styles.collectionBanner, { backgroundColor: colors.navy }]}>
        <View style={styles.bannerTop}>
          <View style={{ flex: 1, gap: 7 }}>
            <Text style={[styles.bannerKicker, { color: colors.gold }]}>CULTURE CARDS</Text>
            <Text style={[styles.bannerTitle, { color: colors.onDark }]}>
              {discovered.length} {discovered.length === 1 ? 'story' : 'stories'} collected
            </Text>
          </View>
          <View style={[styles.cardStack, { backgroundColor: `${colors.onDark}20` }]}>
            <Feather name="layers" size={24} color={colors.gold} />
          </View>
        </View>
        <Text style={[styles.bannerText, { color: `${colors.onDark}C7` }]}>
          Card rarity and XP are game metadata, separate from UNESCO's site facts.
        </Text>
        <View style={styles.bannerProgress}>
          <View style={[styles.progressTrack, { backgroundColor: `${colors.onDark}25` }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, (progress.completedMissionIds.length / 3) * 100)}%`, backgroundColor: colors.gold },
              ]}
            />
          </View>
          <Text style={[styles.vaultLabel, { color: `${colors.onDark}C7` }]}>
            {vaultUnlocked ? 'VAULT OPEN' : `${Math.min(progress.completedMissionIds.length, 3)} / 3 MISSIONS TO OPEN THE VAULT`}
          </Text>
        </View>
      </View>

      {heritage.isLoading ? (
        <LoadingState />
      ) : heritage.isError ? (
        <>
          <EmptyState
            title="Your cards need the UNESCO dataset"
            body="Heritage data is temporarily unavailable. Please try again."
            icon="wifi-off"
          />
          <ActionButton title="TRY AGAIN" icon="refresh-cw" secondary onPress={() => void heritage.refetch()} />
        </>
      ) : discovered.length ? (
        <View style={styles.cards}>
          {discovered.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onPress={() => router.push({ pathname: '/heritage/[id]', params: { id: site.id } })}
              meta={
                <View style={styles.gameMetadata}>
                  <Pill tone="terracotta">GAME RARITY · {rarityFor(site)}</Pill>
                  <Text style={[styles.cardXp, { color: colors.terracotta }]}>+20 GAME XP</Text>
                </View>
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState
          title="Your first card is waiting"
          body="Open Explore India and tap a UNESCO site to discover it. Each first discovery adds 20 XP."
          icon="layers"
        />
      )}

      {!vaultUnlocked && !heritage.isError ? (
        <View style={[styles.lockedCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={[styles.lockIcon, { backgroundColor: colors.secondary }]}>
            <Feather name="lock" size={18} color={colors.terracotta} />
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={[styles.lockTitle, { color: colors.foreground }]}>The culture-card vault</Text>
            <Text style={[styles.lockCopy, { color: colors.mutedForeground }]}>
              Complete three missions to reveal all UNESCO cards. Discover each site to collect its card.
            </Text>
          </View>
        </View>
      ) : vaultUnlocked && sites.length > discovered.length ? (
        <View style={styles.cards}>
          <Text style={[styles.vaultHeading, { color: colors.foreground }]}>Uncollected UNESCO cards</Text>
          {sites
            .filter((site) => !progress.discoveredSiteIds.includes(site.id))
            .slice(0, 5)
            .map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onPress={() => router.push({ pathname: '/heritage/[id]', params: { id: site.id } })}
                meta={<Pill>DISCOVER TO COLLECT</Pill>}
              />
            ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  collectionBanner: { borderRadius: 24, padding: 20, gap: 15 },
  bannerTop: { flexDirection: 'row', alignItems: 'center' },
  bannerKicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  bannerTitle: { fontFamily: 'Georgia', fontSize: 27, fontWeight: '700' },
  cardStack: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  bannerText: { fontSize: 11, lineHeight: 17 },
  bannerProgress: { gap: 8 },
  progressTrack: { height: 7, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  vaultLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  cards: { gap: 14 },
  gameMetadata: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  cardXp: { fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  lockedCard: { borderRadius: 21, borderWidth: 1, padding: 16, flexDirection: 'row', gap: 13, alignItems: 'center' },
  lockIcon: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  lockTitle: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '700' },
  lockCopy: { fontSize: 11, lineHeight: 17 },
  vaultHeading: { fontFamily: 'Georgia', fontSize: 21, fontWeight: '700', marginBottom: 2 },
});