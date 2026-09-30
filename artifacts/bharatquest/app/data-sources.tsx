import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActionButton, Heading, IconButton, Pill, Screen } from '@/components/game-ui';
import { useColors } from '@/hooks/useColors';

const sources = [
  {
    name: 'UNESCO World Heritage DataHub',
    label: 'World Heritage List · whc001',
    url: 'https://data.unesco.org/explore/dataset/whc001/',
    active: true,
    description: 'The current app data source for site names, descriptions, category, inscription year, criteria, coordinates, and UNESCO-listed image credits when provided.',
  },
  {
    name: 'Government of India Open Government Data',
    label: 'data.gov.in',
    url: 'https://data.gov.in/',
    active: false,
    description: 'Official catalog for future use. Government datasets are not currently used for the heritage records displayed in this prototype.',
  },
  {
    name: 'Archaeological Survey of India',
    label: 'ASI',
    url: 'https://asi.nic.in/',
    active: false,
    description: 'Official reference source. No ASI-derived claims are included in the current site records.',
  },
  {
    name: 'Ministry of Culture',
    label: 'Government of India',
    url: 'https://www.indiaculture.gov.in/',
    active: false,
    description: 'Official reference source for future enrichment. Current site details are attributed to UNESCO only.',
  },
];

async function openUrl(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    // Source URLs remain visible if a browser is unavailable.
  }
}

export default function DataSourcesScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" label="Back" onPress={() => router.back()} />
        <View style={styles.spacer} />
      </View>
      <Heading
        title="Our sources"
        subtitle="Each factual heritage detail stays attached to the source that provided it."
        eyebrow="DATA TRANSPARENCY"
      />
      <View style={[styles.notice, { backgroundColor: colors.navy }]}>
        <Feather name="shield" size={18} color={colors.gold} />
        <Text style={[styles.noticeText, { color: colors.onDark }]}>
          If the UNESCO API is unavailable, BharatQuest serves the PostgreSQL cache. If neither source is available, it shows an error instead of made-up facts.
        </Text>
      </View>
      {sources.map((source) => (
        <View key={source.url} style={[styles.sourceCard, { backgroundColor: colors.card, borderColor: source.active ? colors.jade : colors.border }]}>
          <View style={styles.sourceTop}>
            <View style={[styles.sourceIcon, { backgroundColor: source.active ? colors.jade : colors.secondary }]}>
              <Feather name={source.active ? 'check' : 'globe'} size={17} color={source.active ? colors.onDark : colors.jade} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.sourceName, { color: colors.foreground }]}>{source.name}</Text>
              <Text style={[styles.sourceLabel, { color: colors.mutedForeground }]}>{source.label}</Text>
            </View>
            <Pill tone={source.active ? 'jade' : 'muted'}>
              {source.active ? 'IN USE' : 'REFERENCE'}
            </Pill>
          </View>
          <Text style={[styles.description, { color: colors.secondaryForeground }]}>{source.description}</Text>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`View ${source.name} source`}
            testID={`source-${source.label.toLowerCase().replaceAll(' ', '-')}`}
            onPress={() => void openUrl(source.url)}
            style={({ pressed }) => [styles.link, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.url, { color: colors.jade }]}>{source.url}</Text>
            <Feather name="external-link" size={15} color={colors.jade} />
          </Pressable>
        </View>
      ))}
      <View style={[styles.policy, { backgroundColor: colors.parchment }]}>
        <Text style={[styles.policyTitle, { color: colors.foreground }]}>What we do not fill in</Text>
        <Text style={[styles.policyText, { color: colors.secondaryForeground }]}>
          UNESCO’s State Party field is not an Indian administrative-state field. When the source has no state, coordinates, date, image credit, or description, that value stays unavailable in the app.
        </Text>
      </View>
      <ActionButton
        title="BACK TO EXPLORING"
        icon="map"
        secondary
        onPress={() => router.push('/(tabs)/explore')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row' },
  spacer: { flex: 1 },
  notice: { borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 17 },
  sourceCard: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  sourceTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sourceIcon: { width: 37, height: 37, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  sourceName: { fontFamily: 'Georgia', fontSize: 16, fontWeight: '700' },
  sourceLabel: { fontSize: 10 },
  description: { fontSize: 11, lineHeight: 17 },
  link: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  url: { fontSize: 10, lineHeight: 15, fontWeight: '700', flex: 1 },
  policy: { padding: 16, borderRadius: 18, gap: 7 },
  policyTitle: { fontFamily: 'Georgia', fontSize: 17, fontWeight: '700' },
  policyText: { fontSize: 10, lineHeight: 16 },
});