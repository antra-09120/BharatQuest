import React, { useEffect } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  getGetHeritageByIdQueryKey,
  useGetHeritageById,
} from '@workspace/api-client-react';
import {
  ActionButton,
  EmptyState,
  Heading,
  IconButton,
  LoadingState,
  Pill,
  Screen,
  SiteArtwork,
  SourceLine,
} from '@/components/game-ui';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';

export default function HeritageDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const heritage = useGetHeritageById(id ?? '', {
    query: {
      queryKey: getGetHeritageByIdQueryKey(id ?? ''),
      enabled: Boolean(id),
    },
  });
  const site = heritage.data;
  const { discoverSite } = useGame();

  useEffect(() => {
    if (site?.id) discoverSite(site.id);
  }, [site?.id, discoverSite]);

  const openSource = async () => {
    if (!site?.sourceUrl) return;
    try {
      await Linking.openURL(site.sourceUrl);
    } catch {
      // Keep the app usable if the operating system cannot open the source link.
    }
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" label="Back" onPress={() => router.back()} />
        <Text style={[styles.topTitle, { color: colors.foreground }]}>Site journal</Text>
        <View style={styles.spacer} />
      </View>
      {heritage.isLoading ? (
        <LoadingState message="Opening UNESCO record…" />
      ) : heritage.isError || !site ? (
        <>
          <EmptyState
            title="This record could not be opened"
            body="Heritage data is temporarily unavailable. Please try again."
            icon="wifi-off"
          />
          <ActionButton title="GO BACK" icon="arrow-left" secondary onPress={() => router.back()} />
        </>
      ) : (
        <>
          <SiteArtwork site={site} height={238} />
          <View style={styles.siteHeader}>
            <View style={styles.pills}>
              <Pill tone={site.category === 'Natural' ? 'jade' : site.category === 'Mixed' ? 'terracotta' : 'saffron'}>
                {site.category ?? 'UNESCO category unavailable'}
              </Pill>
              <Pill>{site.yearInscribed ? `INSCRIBED ${site.yearInscribed}` : 'INSCRIPTION YEAR UNAVAILABLE'}</Pill>
            </View>
            <Heading title={site.name} subtitle={`${site.state ? `${site.state} · ` : ''}${site.country}`} />
            {site.imageAuthor || site.imageCopyright || site.imageCaption ? (
              <Text style={[styles.imageCredit, { color: colors.mutedForeground }]}>
                {site.imageCaption ? `${site.imageCaption}  ·  ` : ''}
                {site.imageAuthor ? `Image: ${site.imageAuthor}` : ''}
                {site.imageCopyright ? `  ·  ${site.imageCopyright}` : ''}
              </Text>
            ) : null}
          </View>

          <View style={[styles.story, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.storyHeading}>
              <View style={[styles.storyIcon, { backgroundColor: colors.accent }]}>
                <Feather name="book-open" size={16} color={colors.accentForeground} />
              </View>
              <Text style={[styles.storyTitle, { color: colors.foreground }]}>The story</Text>
            </View>
            <Text style={[styles.storyText, { color: colors.secondaryForeground }]}>
              {site.description ??
                site.shortDescription ??
                'UNESCO has not supplied a description for this record.'}
            </Text>
            <Text style={[styles.storyCaption, { color: colors.mutedForeground }]}>
              Description from {site.sourceName}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Why it matters</Text>
            <View style={[styles.factRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.factLabel, { color: colors.mutedForeground }]}>UNESCO category</Text>
              <Text style={[styles.factValue, { color: colors.foreground }]}>
                {site.category ?? 'Unavailable in this record'}
              </Text>
            </View>
            <View style={[styles.factRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.factLabel, { color: colors.mutedForeground }]}>UNESCO criteria</Text>
              <Text style={[styles.factValue, { color: colors.foreground }]}>
                {site.criteria ?? 'Unavailable in this record'}
              </Text>
            </View>
            {site.region ? (
              <View style={[styles.factRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.factLabel, { color: colors.mutedForeground }]}>UNESCO region</Text>
                <Text style={[styles.factValue, { color: colors.foreground }]}>{site.region}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Location</Text>
            <View style={[styles.locationCard, { backgroundColor: colors.mapWater, borderColor: colors.border }]}>
              <Feather name="map-pin" size={19} color={colors.terracotta} />
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={[styles.factValue, { color: colors.foreground }]}>
                  {site.state ? `${site.state}, ` : ''}{site.country}
                </Text>
                {site.latitude != null && site.longitude != null ? (
                  <Text style={[styles.coordText, { color: colors.mutedForeground }]}>
                    {site.latitude.toFixed(5)}° N, {site.longitude.toFixed(5)}° E · UNESCO coordinates
                  </Text>
                ) : (
                  <Text style={[styles.coordText, { color: colors.mutedForeground }]}>
                    Coordinates unavailable in this UNESCO record.
                  </Text>
                )}
                {!site.state ? (
                  <Text style={[styles.coordText, { color: colors.mutedForeground }]}>
                    Administrative state is not provided by this record.
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View style={[styles.mission, { backgroundColor: colors.navy }]}>
            <Pill tone="saffron">YOUR MISSION</Pill>
            <Text style={[styles.missionTitle, { color: colors.onDark }]}>Match this site</Text>
            <Text style={[styles.missionCopy, { color: `${colors.onDark}C5` }]}>
              Use the UNESCO-listed category as the answer. Correct matches can earn 50 XP once per site.
            </Text>
            <ActionButton
              title="PLAY HERITAGE MATCH"
              icon="target"
              onPress={() =>
                router.push({
                  pathname: '/game-match',
                  params: { mode: 'category', siteId: site.id },
                })
              }
              testID="play-site-match"
            />
          </View>

          {site.components ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Listed components</Text>
              <Text style={[styles.componentsText, { color: colors.mutedForeground }]}>
                {site.components}
              </Text>
            </View>
          ) : null}

          <View style={[styles.sourceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sourceTitle, { color: colors.foreground }]}>Source record</Text>
            <Text style={[styles.sourceCopy, { color: colors.mutedForeground }]}>
              This site's displayed facts come from the UNESCO World Heritage DataHub dataset.
            </Text>
            <SourceLine sourceName={site.sourceName} onPress={() => void openSource()} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topTitle: { flex: 1, fontSize: 13, fontWeight: '800' },
  spacer: { width: 42 },
  siteHeader: { gap: 10 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  imageCredit: { fontSize: 9, lineHeight: 14 },
  story: { borderRadius: 21, borderWidth: 1, padding: 17, gap: 12 },
  storyHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  storyIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  storyTitle: { fontFamily: 'Georgia', fontSize: 20, fontWeight: '700' },
  storyText: { fontSize: 13, lineHeight: 21 },
  storyCaption: { fontSize: 9, fontWeight: '600' },
  section: { gap: 9 },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 20, fontWeight: '700' },
  factRow: { borderWidth: 1, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  factLabel: { fontSize: 10, fontWeight: '700' },
  factValue: { fontSize: 12, fontWeight: '800', textAlign: 'right', flexShrink: 1 },
  locationCard: { borderWidth: 1, borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  coordText: { fontSize: 10, lineHeight: 15 },
  mission: { borderRadius: 23, padding: 19, gap: 11 },
  missionTitle: { fontFamily: 'Georgia', fontSize: 27, fontWeight: '700' },
  missionCopy: { fontSize: 12, lineHeight: 18 },
  componentsText: { fontSize: 11, lineHeight: 18 },
  sourceCard: { borderWidth: 1, borderRadius: 19, padding: 16, gap: 7 },
  sourceTitle: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '700' },
  sourceCopy: { fontSize: 10, lineHeight: 16 },
});