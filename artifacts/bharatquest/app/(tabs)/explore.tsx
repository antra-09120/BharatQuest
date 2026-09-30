import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGetIndiaHeritage, type HeritageSite } from '@workspace/api-client-react';
import { IndiaMap } from '@/components/IndiaMap';
import {
  ActionButton,
  BrandHeader,
  EmptyState,
  Heading,
  Pill,
  Screen,
  SectionHeading,
} from '@/components/game-ui';
import { useGame } from '@/context/GameContext';
import { useColors } from '@/hooks/useColors';

type CategoryFilter = 'All' | 'Cultural' | 'Natural' | 'Mixed';
type Coordinates = { latitude: number; longitude: number };

function distanceKm(from: Coordinates, to: HeritageSite): number | null {
  if (to.latitude == null || to.longitude == null) return null;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLongitude / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ExploreScreen() {
  const colors = useColors();
  const router = useRouter();
  const { discoverSite } = useGame();
  const heritage = useGetIndiaHeritage();
  const sites = heritage.data ?? [];
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [selected, setSelected] = useState<HeritageSite | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [nearMe, setNearMe] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  const visibleSites = useMemo(() => {
    const filtered =
      category === 'All'
        ? sites
        : sites.filter((site) => site.category === category);
    if (!nearMe || !userLocation) return filtered;
    return [...filtered].sort(
      (left, right) =>
        (distanceKm(userLocation, left) ?? Number.POSITIVE_INFINITY) -
        (distanceKm(userLocation, right) ?? Number.POSITIVE_INFINITY),
    );
  }, [sites, category, nearMe, userLocation]);

  const selectSite = (site: HeritageSite) => {
    setSelected(site);
    discoverSite(site.id);
  };

  const enableNearMe = async () => {
    setLocationMessage('');
    try {
      if (Platform.OS === 'web') {
        if (!navigator.geolocation) {
          setLocationMessage('Location is not available in this browser.');
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setNearMe(true);
            setLocationMessage('Approximate location is only used on this screen.');
          },
          () => setLocationMessage('Location was not shared. You can keep exploring the map.'),
          { enableHighAccuracy: false, timeout: 12_000 },
        );
        return;
      }

      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted) permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationMessage('Location was not shared. The map still works without it.');
        if (!permission.canAskAgain) {
          Alert.alert(
            'Location is off',
            'You can enable location access in device settings. Your location is never saved to your BharatQuest profile.',
            [
              { text: 'Not now', style: 'cancel' },
              { text: 'Open settings', onPress: () => void Linking.openSettings().catch(() => undefined) },
            ],
          );
        }
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setNearMe(true);
      setLocationMessage('Approximate location is only used on this screen.');
    } catch {
      setLocationMessage('Location is unavailable right now. You can keep exploring the map.');
    }
  };

  const toggleNearMe = () => {
    if (nearMe) {
      setNearMe(false);
      setUserLocation(null);
      setLocationMessage('');
    } else {
      void enableNearMe();
    }
  };

  const categories: CategoryFilter[] = ['All', 'Cultural', 'Natural', 'Mixed'];

  return (
    <Screen withTabs>
      <BrandHeader onSearch={() => router.push('/search')} />
      <Heading
        title="Explore India"
        subtitle="Every marker follows a UNESCO-listed coordinate. Tap a site to open its story."
        eyebrow="THE GAME WORLD"
      />

      <View style={styles.mapHeading}>
        <SectionHeading title="The living atlas" />
        <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
          {visibleSites.length} sites
        </Text>
      </View>
      {heritage.isLoading ? (
        <View style={[styles.mapLoading, { backgroundColor: colors.mapWater }]}>
          <Feather name="map" size={28} color={colors.jade} />
          <Text style={[styles.mapLoadingText, { color: colors.mutedForeground }]}>
            Loading UNESCO coordinates…
          </Text>
        </View>
      ) : heritage.isError ? (
        <EmptyState
          title="Heritage data is temporarily unavailable"
          body="Please try again. No invented places will be shown."
          icon="wifi-off"
        />
      ) : (
        <>
          <IndiaMap
            sites={visibleSites}
            selectedId={selected?.id}
            onSelect={selectSite}
            userLocation={userLocation}
          />
          <View style={styles.filters}>
            {categories.map((item) => {
              const active = category === item;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  testID={`filter-${item.toLowerCase()}`}
                  onPress={() => {
                    setCategory(item);
                    setSelected(null);
                  }}
                  style={({ pressed }) => [
                    styles.filter,
                    {
                      backgroundColor: active ? colors.navy : colors.card,
                      borderColor: active ? colors.navy : colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: active ? colors.onDark : colors.secondaryForeground },
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: nearMe }}
              testID="near-me"
              onPress={toggleNearMe}
              style={({ pressed }) => [
                styles.filter,
                {
                  backgroundColor: nearMe ? colors.jade : colors.card,
                  borderColor: nearMe ? colors.jade : colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name="navigation" size={12} color={nearMe ? colors.onDark : colors.jade} />
              <Text style={[styles.filterText, { color: nearMe ? colors.onDark : colors.secondaryForeground }]}>
                Near me
              </Text>
            </Pressable>
          </View>
          {locationMessage ? (
            <Text style={[styles.locationMessage, { color: colors.mutedForeground }]}>
              {locationMessage}
            </Text>
          ) : null}
          {nearMe && userLocation && visibleSites[0] ? (
            <Text style={[styles.locationMessage, { color: colors.jade }]}>
              Nearest in this dataset: {visibleSites[0].name}
              {distanceKm(userLocation, visibleSites[0]) != null
                ? ` · ${distanceKm(userLocation, visibleSites[0])?.toFixed(1)} km`
                : ''}
            </Text>
          ) : null}

          {selected ? (
            <View style={[styles.selectedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.selectedTop}>
                <View style={{ flex: 1, gap: 7 }}>
                  <Pill tone={selected.category === 'Natural' ? 'jade' : selected.category === 'Mixed' ? 'terracotta' : 'saffron'}>
                    {selected.category ?? 'UNESCO site'}
                  </Pill>
                  <Text style={[styles.selectedName, { color: colors.foreground }]}>
                    {selected.name}
                  </Text>
                  <Text style={[styles.selectedMeta, { color: colors.mutedForeground }]}>
                    {selected.state ? `${selected.state} · ` : ''}
                    {selected.country}
                    {selected.yearInscribed ? ` · Inscribed ${selected.yearInscribed}` : ''}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close site preview"
                  onPress={() => setSelected(null)}
                  style={styles.closeButton}
                >
                  <Feather name="x" size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>
              <Text style={[styles.selectedSummary, { color: colors.secondaryForeground }]} numberOfLines={3}>
                {selected.shortDescription ?? 'UNESCO has not supplied a short description for this record.'}
              </Text>
              <Text style={[styles.selectedSource, { color: colors.mutedForeground }]}>
                Source: {selected.sourceName}
              </Text>
              <ActionButton
                title="EXPLORE STORY"
                icon="arrow-up-right"
                onPress={() => router.push({ pathname: '/heritage/[id]', params: { id: selected.id } })}
                testID="explore-story"
              />
            </View>
          ) : null}
          <View style={styles.mapNote}>
            <Feather name="info" size={14} color={colors.jade} />
            <Text style={[styles.mapNoteText, { color: colors.mutedForeground }]}>
              Schematic outline; markers use UNESCO coordinates. Administrative states are not included where the record does not provide them.
            </Text>
          </View>

          <View style={styles.listHeading}>
            <SectionHeading title={nearMe ? 'Closest discoveries' : 'Discover a site'} />
            <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
              Source: UNESCO
            </Text>
          </View>
          {visibleSites.slice(0, 12).map((site) => (
            <Pressable
              key={site.id}
              accessibilityRole="button"
              testID={`explore-site-${site.id}`}
              onPress={() => selectSite(site)}
              style={({ pressed }) => [
                styles.listRow,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <View style={[styles.listIcon, { backgroundColor: colors.secondary }]}>
                <Feather name="map-pin" size={17} color={colors.terracotta} />
              </View>
              <View style={styles.listCopy}>
                <Text style={[styles.listName, { color: colors.foreground }]} numberOfLines={1}>
                  {site.name}
                </Text>
                <Text style={[styles.listMeta, { color: colors.mutedForeground }]}>
                  {site.category ?? 'Category unavailable'}
                  {site.yearInscribed ? ` · ${site.yearInscribed}` : ''}
                  {nearMe && userLocation && distanceKm(userLocation, site) != null
                    ? ` · ${distanceKm(userLocation, site)?.toFixed(1)} km`
                    : ''}
                </Text>
                <Text style={[styles.sourceTiny, { color: colors.mutedForeground }]}>
                  Source: {site.sourceName}
                </Text>
              </View>
              <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </>
      )}
      {heritage.isError ? (
        <ActionButton
          title="TRY AGAIN"
          icon="refresh-cw"
          secondary
          onPress={() => void heritage.refetch()}
          testID="retry-explore"
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultCount: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  mapLoading: { minHeight: 340, alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 24 },
  mapLoadingText: { fontSize: 12, fontWeight: '600' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { borderWidth: 1, borderRadius: 999, minHeight: 37, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  filterText: { fontSize: 10, fontWeight: '800' },
  locationMessage: { fontSize: 11, lineHeight: 17, marginTop: -11 },
  selectedCard: { padding: 18, borderRadius: 22, borderWidth: 1, gap: 13 },
  selectedTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  selectedName: { fontFamily: 'Georgia', fontSize: 23, fontWeight: '700', lineHeight: 28 },
  selectedMeta: { fontSize: 11, fontWeight: '600' },
  selectedSummary: { fontSize: 13, lineHeight: 20 },
  selectedSource: { fontSize: 10 },
  closeButton: { padding: 6 },
  mapNote: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  mapNoteText: { flex: 1, fontSize: 10, lineHeight: 16 },
  listHeading: { gap: 6, marginTop: 5 },
  listRow: { borderWidth: 1, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11 },
  listIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  listCopy: { flex: 1, gap: 4 },
  listName: { fontSize: 13, fontWeight: '800' },
  listMeta: { fontSize: 10, fontWeight: '600' },
  sourceTiny: { fontSize: 9, marginTop: 1 },
});