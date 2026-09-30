import React from 'react';
import { Redirect } from 'expo-router';
import { LoadingState, Screen } from '@/components/game-ui';
import { useGame } from '@/context/GameContext';

export default function IndexRoute() {
  const { hydrated, progress } = useGame();
  if (!hydrated) {
    return (
      <Screen>
        <LoadingState message="Opening your journey…" />
      </Screen>
    );
  }
  return <Redirect href={progress.didOnboard ? '/(tabs)' : '/welcome'} />;
}