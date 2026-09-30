import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { HeritageSite } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

const MAP_WIDTH = 320;
const MAP_HEIGHT = 346;
const MIN_LAT = 6.5;
const MAX_LAT = 37.5;
const MIN_LON = 67.5;
const MAX_LON = 98;

function mapCoordinate(latitude: number, longitude: number) {
  return {
    x: 30 + ((longitude - MIN_LON) / (MAX_LON - MIN_LON)) * 260,
    y: 14 + ((MAX_LAT - latitude) / (MAX_LAT - MIN_LAT)) * 310,
  };
}

export function mapPoint(site: HeritageSite) {
  if (site.latitude == null || site.longitude == null) return null;
  return mapCoordinate(site.latitude, site.longitude);
}

export function mapQuadrant(site: HeritageSite, sites: HeritageSite[]) {
  const coordinates = sites.filter(
    (item) => item.latitude != null && item.longitude != null,
  );
  if (!coordinates.length || site.latitude == null || site.longitude == null) {
    return null;
  }
  const latitudes = coordinates.map((item) => item.latitude as number);
  const longitudes = coordinates.map((item) => item.longitude as number);
  const middleLatitude = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const middleLongitude = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
  const vertical = site.latitude >= middleLatitude ? 'North' : 'South';
  const horizontal = site.longitude < middleLongitude ? 'West' : 'East';
  return `${vertical}-${horizontal}`;
}

export function IndiaMap({
  sites,
  selectedId,
  onSelect,
  showMarkers = true,
  userLocation,
}: {
  sites: HeritageSite[];
  selectedId?: string;
  onSelect?: (site: HeritageSite) => void;
  showMarkers?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
}) {
  const colors = useColors();
  const [availableWidth, setAvailableWidth] = useState(MAP_WIDTH);
  const mapWidth = Math.min(MAP_WIDTH, availableWidth);
  const scale = mapWidth / MAP_WIDTH;
  const mapHeight = MAP_HEIGHT * scale;
  const markerColor = (category: string | null) => {
    if (category === 'Natural') return colors.jade;
    if (category === 'Mixed') return colors.terracotta;
    return colors.saffron;
  };

  return (
    <View
      accessibilityLabel="Schematic map of India with UNESCO coordinate markers"
      style={[styles.mapCard, { backgroundColor: colors.mapWater, borderColor: colors.border }]}
    >
      <View
        style={[styles.mapGraphic, { height: mapHeight }]}
        onLayout={(event) =>
          setAvailableWidth(
            Math.max(1, Math.min(MAP_WIDTH, event.nativeEvent.layout.width)),
          )
        }
      >
        <Svg
          width={mapWidth}
          height={mapHeight}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        >
          <Path
            d="M133 12 L157 18 174 31 190 41 202 59 213 78 228 91 244 96 263 112 255 128 235 136 231 153 221 164 215 181 205 198 202 215 193 231 188 251 174 268 167 291 151 325 139 307 132 284 120 269 115 248 105 235 100 216 87 201 82 183 67 169 57 151 47 135 40 119 51 104 63 91 78 81 92 65 105 53 115 37 125 26 Z"
            fill={colors.mapLand}
            stroke={colors.jade}
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
          <Path
            d="M237 92 L251 82 271 88 281 99 272 110 256 109"
            fill={colors.mapLand}
            stroke={colors.jade}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <Path
            d="M118 66 C148 81 163 102 179 124 C191 143 195 169 183 193 C176 212 162 235 156 257"
            fill="none"
            stroke={colors.saffron}
            strokeOpacity={0.42}
            strokeWidth={2}
            strokeDasharray="5 7"
          />
          {showMarkers
            ? sites.map((site) => {
                const point = mapPoint(site);
                if (!point) return null;
                const selected = selectedId === site.id;
                return (
                  <React.Fragment key={site.id}>
                    {selected ? (
                      <Circle
                        cx={point.x}
                        cy={point.y}
                        r={14}
                        fill={markerColor(site.category)}
                        fillOpacity={0.2}
                      />
                    ) : null}
                    <Circle
                      cx={point.x}
                      cy={point.y}
                      r={selected ? 8 : 5}
                      fill={markerColor(site.category)}
                      stroke={colors.card}
                      strokeWidth={2}
                    />
                  </React.Fragment>
                );
              })
            : null}
          {userLocation ? (
            <Circle
              cx={mapCoordinate(userLocation.latitude, userLocation.longitude).x}
              cy={mapCoordinate(userLocation.latitude, userLocation.longitude).y}
              r={7}
              fill={colors.navy}
              stroke={colors.card}
              strokeWidth={3}
            />
          ) : null}
        </Svg>
        {showMarkers && onSelect
          ? sites.map((site) => {
              const point = mapPoint(site);
              if (!point) return null;
              const selected = selectedId === site.id;
              return (
                <Pressable
                  key={site.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Explore ${site.name}`}
                  accessibilityState={{ selected }}
                  testID={`map-marker-${site.id}`}
                  onPress={() => onSelect(site)}
                  style={[
                    styles.markerHitArea,
                    {
                      left: (availableWidth - mapWidth) / 2 + point.x * scale - 14,
                      top: point.y * scale - 14,
                    },
                  ]}
                />
              );
            })
          : null}
      </View>
      <View style={styles.legend}>
        <Text style={[styles.legendCaption, { color: colors.mutedForeground }]}>
          SCHEMATIC MAP · MARKERS FROM UNESCO COORDINATES
        </Text>
        <View style={styles.legendItems}>
          {[
            ['Cultural', colors.saffron],
            ['Natural', colors.jade],
            ['Mixed', colors.terracotta],
          ].map(([label, color]) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={[styles.legendText, { color: colors.secondaryForeground }]}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 25,
    paddingTop: 12,
    paddingBottom: 14,
  },
  mapGraphic: { width: '100%', alignItems: 'center' },
  markerHitArea: { position: 'absolute', width: 28, height: 28, borderRadius: 14 },
  legend: { width: '100%', alignItems: 'center', gap: 11, paddingHorizontal: 12 },
  legendCaption: { fontSize: 8, fontWeight: '800', letterSpacing: 1.1, textAlign: 'center' },
  legendItems: { flexDirection: 'row', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontSize: 10, fontWeight: '700' },
});