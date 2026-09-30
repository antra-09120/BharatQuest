import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  getGetIndiaHeritageQueryKey,
  getSearchHeritageQueryKey,
  useGetIndiaHeritage,
  useSearchHeritage,
} from '@workspace/api-client-react';
import {
  ActionButton,
  EmptyState,
  Heading,
  IconButton,
  LoadingState,
  Screen,
  SiteCard,
} from '@/components/game-ui';
import { useColors } from '@/hooks/useColors';

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const trimmedQuery = query.trim();
  const search = useSearchHeritage(
    { q: trimmedQuery || ' ' },
    {
      query: {
        queryKey: getSearchHeritageQueryKey({ q: trimmedQuery || ' ' }),
        enabled: trimmedQuery.length >= 2,
      },
    },
  );
  const india = useGetIndiaHeritage({
    query: {
      queryKey: getGetIndiaHeritageQueryKey(),
      enabled: trimmedQuery.length < 2,
    },
  });
  const results = trimmedQuery.length >= 2 ? search.data : india.data?.slice(0, 3);
  const isLoading =
    trimmedQuery.length >= 2 ? search.isLoading : india.isLoading;
  const hasError = trimmedQuery.length >= 2 ? search.isError : india.isError;

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton
          icon="arrow-left"
          label="Back"
          onPress={() => router.back()}
          testID="search-back"
        />
        <Text style={[styles.topTitle, { color: colors.foreground }]}>Search the atlas</Text>
        <View style={styles.spacer} />
      </View>
      <Heading
        title="Find a story"
        subtitle="Search site names, country, region, and UNESCO category in the India dataset."
        eyebrow="GLOBAL SEARCH"
      />
      <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.jade} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Try “Agra Fort” or “Cultural”"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search heritage records"
          testID="heritage-search"
          style={[styles.input, { color: colors.foreground }]}
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery('')}
            style={({ pressed }) => pressed && { opacity: 0.65 }}
          >
            <Feather name="x-circle" size={17} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
      <Text style={[styles.sourceNote, { color: colors.mutedForeground }]}>
        {trimmedQuery.length >= 2
          ? 'Search results are returned by the BharatQuest API from its UNESCO cache.'
          : 'Start typing to search all cached records. Featured suggestions below are also from UNESCO.'}
      </Text>

      {isLoading ? (
        <LoadingState message="Searching UNESCO records…" />
      ) : hasError ? (
        <EmptyState
          title="Search is temporarily unavailable"
          body="Please try again when the UNESCO heritage cache is reachable."
          icon="wifi-off"
        />
      ) : results?.length ? (
        <View style={styles.results}>
          {trimmedQuery.length < 2 ? (
            <Text style={[styles.resultsHeading, { color: colors.foreground }]}>Start with these records</Text>
          ) : (
            <Text style={[styles.resultsHeading, { color: colors.foreground }]}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </Text>
          )}
          {results.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onPress={() => router.push({ pathname: '/heritage/[id]', params: { id: site.id } })}
            />
          ))}
        </View>
      ) : trimmedQuery.length >= 2 ? (
        <EmptyState
          title="No matches found"
          body="Try a different site name, country, UNESCO region, or category."
          icon="search"
        />
      ) : (
        <ActionButton
          title="EXPLORE ALL SITES"
          icon="map"
          secondary
          onPress={() => router.push('/(tabs)/explore')}
          testID="search-explore-all"
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topTitle: { fontSize: 13, fontWeight: '800', flex: 1 },
  spacer: { width: 42 },
  inputWrap: { minHeight: 54, borderWidth: 1, borderRadius: 17, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 11 },
  input: { flex: 1, fontSize: 13, minHeight: 50 },
  sourceNote: { fontSize: 10, lineHeight: 16, marginTop: -12 },
  results: { gap: 14 },
  resultsHeading: { fontFamily: 'Georgia', fontSize: 19, fontWeight: '700' },
});