import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';
import { ActionButton, Eyebrow, Screen } from '@/components/game-ui';

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setDidOnboard } = useGame();

  const enter = () => {
    setDidOnboard();
    router.replace('/(tabs)');
  };

  return (
    <Screen contentStyle={styles.screen}>
      <ImageBackground
        source={require('../assets/images/world-map-illustration.png')}
        resizeMode="cover"
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          colors={[`${colors.navy}40`, `${colors.navy}E8`, colors.navy]}
          locations={[0, 0.52, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <Eyebrow>BHARATQUEST · SIH 2026</Eyebrow>
          <Text style={[styles.wordmark, { color: colors.onDark }]}>
            Play. Explore.{'\n'}Discover.
          </Text>
          <Text style={[styles.subtitle, { color: colors.onDark }]}>
            India's heritage is the game world.
          </Text>
          <Text style={[styles.body, { color: `${colors.onDark}C7` }]}>
            Follow real UNESCO coordinates, uncover source-backed stories, and
            build a collection one discovery at a time.
          </Text>
          <View style={styles.actions}>
            <ActionButton
              title="START JOURNEY"
              icon="arrow-right"
              onPress={enter}
              testID="start-journey"
            />
            <ActionButton
              title="EXPLORE AS GUEST"
              icon="compass"
              secondary
              onPress={enter}
              testID="explore-as-guest"
            />
          </View>
          <Text style={[styles.footer, { color: `${colors.onDark}A8` }]}>
            Illustrative game-world art · real site data is linked to UNESCO.
          </Text>
        </View>
      </ImageBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, paddingHorizontal: 14, paddingTop: 12 },
  hero: { minHeight: 690, flex: 1, justifyContent: 'flex-end', borderRadius: 30, overflow: 'hidden' },
  heroImage: { borderRadius: 30 },
  heroContent: { paddingHorizontal: 24, paddingTop: 140, paddingBottom: 28, gap: 14 },
  wordmark: { fontFamily: 'Georgia', fontSize: 45, fontWeight: '700', lineHeight: 51, marginTop: 10 },
  subtitle: { fontSize: 17, fontWeight: '700', lineHeight: 24 },
  body: { maxWidth: 320, fontSize: 13, lineHeight: 20, marginBottom: 5 },
  actions: { gap: 10, marginTop: 4 },
  footer: { textAlign: 'center', fontSize: 10, letterSpacing: 0.8, marginTop: 4 },
});