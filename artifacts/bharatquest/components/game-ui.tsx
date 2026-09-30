import React, { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import type { HeritageSite } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

export function Screen({
  children,
  withTabs = false,
  contentStyle,
}: {
  children: ReactNode;
  withTabs?: boolean;
  contentStyle?: ViewStyle;
}) {
  const colors = useColors();
  return (
    <SafeAreaView
      edges={Platform.OS === 'web' ? [] : ['top', 'left', 'right']}
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === 'web' ? 67 : 0,
          paddingBottom: Platform.OS === 'web' ? 34 : 0,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.page,
          { paddingBottom: withTabs ? 128 : 36 },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function BrandHeader({
  onSearch,
  action,
}: {
  onSearch?: () => void;
  action?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.brandHeader}>
      <View style={styles.brand}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.brandIcon}
          accessibilityLabel="BharatQuest mark"
        />
        <View>
          <Text style={[styles.brandName, { color: colors.foreground }]}>
            BHARATQUEST
          </Text>
          <Text style={[styles.brandCaption, { color: colors.mutedForeground }]}>
            INDIA, UNLOCKED
          </Text>
        </View>
      </View>
      {action}
      {onSearch ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search heritage"
          testID="home-search"
          onPress={onSearch}
          style={({ pressed }) => [
            styles.iconButton,
            { borderColor: colors.border, backgroundColor: colors.card },
            pressed && styles.pressed,
          ]}
        >
          <Feather name="search" size={19} color={colors.foreground} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  const colors = useColors();
  return (
    <Text style={[styles.eyebrow, { color: colors.terracotta }]}>
      {children}
    </Text>
  );
}

export function Heading({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.heading}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        {title}
      </Text>
      {action}
    </View>
  );
}

export function Pill({
  children,
  tone = 'muted',
}: {
  children: ReactNode;
  tone?: 'muted' | 'saffron' | 'jade' | 'terracotta' | 'navy';
}) {
  const colors = useColors();
  const toneColors = {
    muted: [colors.muted, colors.mutedForeground],
    saffron: [colors.accent, colors.accentForeground],
    jade: [colors.jade, colors.onDark],
    terracotta: [colors.terracotta, colors.onDark],
    navy: [colors.navy, colors.onDark],
  }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: toneColors[0] }]}>
      <Text style={[styles.pillText, { color: toneColors[1] }]}>
        {children}
      </Text>
    </View>
  );
}

export function ActionButton({
  title,
  onPress,
  icon,
  secondary = false,
  disabled = false,
  testID,
  compact = false,
}: {
  title: string;
  onPress: () => void;
  icon?: React.ComponentProps<typeof Feather>['name'];
  secondary?: boolean;
  disabled?: boolean;
  testID?: string;
  compact?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        {
          backgroundColor: secondary ? colors.secondary : colors.primary,
          borderColor: secondary ? colors.border : colors.primary,
          opacity: disabled ? 0.45 : 1,
        },
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon ? (
        <Feather
          name={icon}
          size={16}
          color={secondary ? colors.secondaryForeground : colors.primaryForeground}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          {
            color: secondary
              ? colors.secondaryForeground
              : colors.primaryForeground,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  testID,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
  label: string;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <Feather name={icon} size={18} color={colors.foreground} />
    </Pressable>
  );
}

export function ProgressBar({
  value,
  total,
  color,
}: {
  value: number;
  total: number;
  color?: string;
}) {
  const colors = useColors();
  const width = Math.max(0, Math.min(1, total > 0 ? value / total : 0));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: value }}
      style={[styles.progressTrack, { backgroundColor: colors.muted }]}
    >
      <View
        style={[
          styles.progressFill,
          { width: `${width * 100}%`, backgroundColor: color ?? colors.primary },
        ]}
      />
    </View>
  );
}

function categoryTone(category: string | null): 'saffron' | 'jade' | 'terracotta' {
  if (category === 'Natural') return 'jade';
  if (category === 'Mixed') return 'terracotta';
  return 'saffron';
}

export function SiteArtwork({
  site,
  height = 172,
  showBadge = true,
}: {
  site: HeritageSite;
  height?: number;
  showBadge?: boolean;
}) {
  const colors = useColors();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [site.imageUrl]);

  const imageLabel =
    site.imageCaption ?? `${site.name}, UNESCO World Heritage`;
  const hasImage = Boolean(site.imageUrl) && !imageFailed;

  return (
    <View style={[styles.artwork, { height, backgroundColor: colors.mapLand }]}>
      {hasImage ? (
        Platform.OS === 'web' ? (
          React.createElement('img', {
            src: site.imageUrl ?? undefined,
            alt: imageLabel,
            referrerPolicy: 'no-referrer',
            onError: () => setImageFailed(true),
            style: {
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            },
          })
        ) : (
          <ExpoImage
            source={{ uri: site.imageUrl ?? undefined }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            cachePolicy="disk"
            transition={250}
            accessibilityLabel={imageLabel}
          />
        )
      ) : (
        <View style={styles.artworkFallback}>
          <Feather
            name={site.category === 'Natural' ? 'feather' : 'aperture'}
            size={38}
            color={colors.jade}
          />
          <Text style={[styles.artworkFallbackText, { color: colors.secondaryForeground }]}>
            {site.imageUrl ? 'Image could not be loaded' : 'Image not listed by UNESCO'}
          </Text>
        </View>
      )}
      {showBadge ? (
        <View style={styles.artworkOverlay}>
          <Pill tone={categoryTone(site.category)}>
            {site.category ?? 'UNESCO site'}
          </Pill>
        </View>
      ) : null}
    </View>
  );
}

export function SiteCard({
  site,
  onPress,
  meta,
}: {
  site: HeritageSite;
  onPress: () => void;
  meta?: ReactNode;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${site.name}`}
      testID={`site-card-${site.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.siteCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <SiteArtwork site={site} />
      <View style={styles.siteCardBody}>
        {meta}
        <Text style={[styles.siteName, { color: colors.foreground }]}>
          {site.name}
        </Text>
        <Text style={[styles.siteLocation, { color: colors.mutedForeground }]}>
          {site.state ? `${site.state}, ` : ''}
          {site.country}
          {site.yearInscribed ? `  ·  ${site.yearInscribed}` : ''}
        </Text>
        <Text style={[styles.sourceCaption, { color: colors.mutedForeground }]}>
          Source: {site.sourceName}
        </Text>
        {site.imageAuthor || site.imageCopyright ? (
          <Text style={[styles.sourceCaption, { color: colors.mutedForeground }]}>
            Image: {[site.imageAuthor, site.imageCopyright].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function LoadingState({ message = 'Loading heritage records…' }: { message?: string }) {
  const colors = useColors();
  return (
    <View style={styles.stateBox} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
        {message}
      </Text>
    </View>
  );
}

export function EmptyState({
  title,
  body,
  icon = 'compass',
}: {
  title: string;
  body: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
}) {
  const colors = useColors();
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={25} color={colors.terracotta} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.stateText, { color: colors.mutedForeground }]}>{body}</Text>
    </View>
  );
}

export function SourceLine({
  sourceName,
  onPress,
}: {
  sourceName: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="link"
      testID="view-source"
      onPress={onPress}
      style={({ pressed }) => [styles.sourceLine, pressed && styles.pressed]}
    >
      <Feather name="external-link" size={14} color={colors.jade} />
      <Text style={[styles.sourceLink, { color: colors.jade }]}>
        Source: {sourceName}  ·  View source
      </Text>
    </Pressable>
  );
}

export function Metric({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: { paddingHorizontal: 20, paddingTop: 14, gap: 22 },
  brandHeader: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  brandIcon: { width: 38, height: 38, borderRadius: 11 },
  brandName: { fontSize: 12, fontWeight: '800', letterSpacing: 1.7 },
  brandCaption: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, marginTop: 3 },
  heading: { gap: 6 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  title: { fontFamily: 'Georgia', fontSize: 32, fontWeight: '700', lineHeight: 38 },
  subtitle: { fontSize: 14, lineHeight: 21, maxWidth: 330 },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: { fontFamily: 'Georgia', fontSize: 21, fontWeight: '700' },
  pill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.65, textTransform: 'uppercase' },
  button: {
    minHeight: 50,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  buttonCompact: { minHeight: 42, paddingHorizontal: 13, borderRadius: 13 },
  buttonText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.65 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  artwork: { width: '100%', overflow: 'hidden', justifyContent: 'flex-start' },
  artworkFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 9 },
  artworkFallbackText: { fontSize: 11, fontWeight: '600' },
  artworkOverlay: { position: 'absolute', top: 12, left: 12 },
  siteCard: {
    borderWidth: 1,
    borderRadius: 23,
    overflow: 'hidden',
    elevation: 2,
  },
  siteCardBody: { padding: 16, gap: 7 },
  siteName: { fontFamily: 'Georgia', fontSize: 21, fontWeight: '700' },
  siteLocation: { fontSize: 12, fontWeight: '600' },
  sourceCaption: { fontSize: 10, marginTop: 4 },
  sourceLine: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 7 },
  sourceLink: { fontSize: 11, fontWeight: '700' },
  stateBox: {
    minHeight: 128,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 22,
  },
  stateText: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  emptyState: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    gap: 10,
  },
  emptyTitle: { fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  metric: {
    flex: 1,
    minHeight: 83,
    padding: 12,
    borderWidth: 1,
    borderRadius: 17,
    gap: 5,
  },
  metricValue: { fontFamily: 'Georgia', fontSize: 24, fontWeight: '700' },
  metricLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 },
});