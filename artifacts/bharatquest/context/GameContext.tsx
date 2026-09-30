import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'bharatquest-progress-v1';
const LEVEL_XP = 500;

export interface GameProgress {
  xp: number;
  discoveredSiteIds: string[];
  completedMissionIds: string[];
  matchCorrectSiteIds: string[];
  mapCorrectSiteIds: string[];
  dailyChallengeDate: string | null;
  lastActiveDate: string | null;
  streak: number;
  displayName: string;
  didOnboard: boolean;
  remindersEnabled: boolean;
  demoMode: boolean;
}

const initialProgress: GameProgress = {
  xp: 0,
  discoveredSiteIds: [],
  completedMissionIds: [],
  matchCorrectSiteIds: [],
  mapCorrectSiteIds: [],
  dailyChallengeDate: null,
  lastActiveDate: null,
  streak: 0,
  displayName: 'Explorer',
  didOnboard: false,
  remindersEnabled: false,
  demoMode: false,
};

interface GameContextValue {
  progress: GameProgress;
  hydrated: boolean;
  level: number;
  levelProgress: number;
  discoverSite: (id: string) => void;
  recordCorrectMatch: (id: string, xpReward?: number) => void;
  recordCorrectMapChallenge: (id: string) => void;
  completeDailyChallenge: () => void;
  setDidOnboard: () => void;
  setDisplayName: (name: string) => void;
  setRemindersEnabled: (enabled: boolean) => void;
  setDemoMode: (enabled: boolean) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function markActive(progress: GameProgress): GameProgress {
  const today = dateKey(new Date());
  const yesterday = dateKey(new Date(Date.now() - 86_400_000));

  if (progress.lastActiveDate === today) return progress;
  return {
    ...progress,
    lastActiveDate: today,
    streak: progress.lastActiveDate === yesterday ? progress.streak + 1 : 1,
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<GameProgress>(initialProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((serialized) => {
        if (!mounted || !serialized) return;
        const stored: unknown = JSON.parse(serialized);
        if (!stored || typeof stored !== 'object') return;
        const value = stored as Partial<GameProgress>;
        setProgress({
          ...initialProgress,
          ...value,
          discoveredSiteIds: Array.isArray(value.discoveredSiteIds)
            ? value.discoveredSiteIds.filter(
                (id): id is string => typeof id === 'string',
              )
            : [],
          completedMissionIds: Array.isArray(value.completedMissionIds)
            ? value.completedMissionIds.filter(
                (id): id is string => typeof id === 'string',
              )
            : [],
          matchCorrectSiteIds: Array.isArray(value.matchCorrectSiteIds)
            ? value.matchCorrectSiteIds.filter(
                (id): id is string => typeof id === 'string',
              )
            : [],
          mapCorrectSiteIds: Array.isArray(value.mapCorrectSiteIds)
            ? value.mapCorrectSiteIds.filter(
                (id): id is string => typeof id === 'string',
              )
            : [],
        });
      })
      .catch(() => {
        if (mounted) setProgress(initialProgress);
      })
      .finally(() => {
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const update = useCallback((change: (previous: GameProgress) => GameProgress) => {
    setProgress((previous) => {
      const next = change(previous);
      if (next !== previous) {
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const discoverSite = useCallback(
    (id: string) => {
      update((previous) => {
        if (previous.discoveredSiteIds.includes(id)) return previous;
        const discoveredSiteIds = [...previous.discoveredSiteIds, id];
        const completedMissionIds = [...previous.completedMissionIds];
        let xp = 20;

        if (
          discoveredSiteIds.length >= 3 &&
          !completedMissionIds.includes('heritage-hunt')
        ) {
          completedMissionIds.push('heritage-hunt');
          xp += 100;
        }
        return {
          ...markActive(previous),
          xp: previous.xp + xp,
          discoveredSiteIds,
          completedMissionIds,
        };
      });
    },
    [update],
  );

  const recordCorrectMatch = useCallback(
    (id: string, xpReward = 50) => {
      update((previous) => {
        if (previous.matchCorrectSiteIds.includes(id)) return previous;
        const matchCorrectSiteIds = [...previous.matchCorrectSiteIds, id];
        const completedMissionIds = [...previous.completedMissionIds];
        let xp = Math.max(0, xpReward);

        if (
          matchCorrectSiteIds.length >= 3 &&
          !completedMissionIds.includes('culture-match')
        ) {
          completedMissionIds.push('culture-match');
          xp += 100;
        }
        if (
          matchCorrectSiteIds.length >= 5 &&
          !completedMissionIds.includes('architecture-match')
        ) {
          completedMissionIds.push('architecture-match');
          xp += 100;
        }

        return {
          ...markActive(previous),
          xp: previous.xp + xp,
          matchCorrectSiteIds,
          completedMissionIds,
        };
      });
    },
    [update],
  );

  const recordCorrectMapChallenge = useCallback(
    (id: string) => {
      update((previous) => {
        if (previous.mapCorrectSiteIds.includes(id)) return previous;
        const mapCorrectSiteIds = [...previous.mapCorrectSiteIds, id];
        const completedMissionIds = [...previous.completedMissionIds];
        let xp = 75;

        if (
          mapCorrectSiteIds.length >= 3 &&
          !completedMissionIds.includes('map-explorer')
        ) {
          completedMissionIds.push('map-explorer');
          xp += 100;
        }

        return {
          ...markActive(previous),
          xp: previous.xp + xp,
          mapCorrectSiteIds,
          completedMissionIds,
        };
      });
    },
    [update],
  );

  const completeDailyChallenge = useCallback(() => {
    update((previous) => {
      const today = dateKey(new Date());
      if (previous.dailyChallengeDate === today) return previous;
      return {
        ...markActive(previous),
        xp: previous.xp + 50,
        dailyChallengeDate: today,
      };
    });
  }, [update]);

  const setDidOnboard = useCallback(() => {
    update((previous) => ({ ...markActive(previous), didOnboard: true }));
  }, [update]);

  const setDisplayName = useCallback(
    (name: string) => {
      update((previous) => ({
        ...previous,
        displayName: name.trim().slice(0, 32) || 'Explorer',
      }));
    },
    [update],
  );

  const setRemindersEnabled = useCallback(
    (enabled: boolean) => {
      update((previous) => ({ ...previous, remindersEnabled: enabled }));
    },
    [update],
  );

  const setDemoMode = useCallback(
    (enabled: boolean) => {
      update((previous) => ({ ...previous, demoMode: enabled }));
    },
    [update],
  );

  const value = useMemo<GameContextValue>(
    () => ({
      progress,
      hydrated,
      level: Math.floor(progress.xp / LEVEL_XP) + 1,
      levelProgress: progress.xp % LEVEL_XP,
      discoverSite,
      recordCorrectMatch,
      recordCorrectMapChallenge,
      completeDailyChallenge,
      setDidOnboard,
      setDisplayName,
      setRemindersEnabled,
      setDemoMode,
    }),
    [
      progress,
      hydrated,
      discoverSite,
      recordCorrectMatch,
      recordCorrectMapChallenge,
      completeDailyChallenge,
      setDidOnboard,
      setDisplayName,
      setRemindersEnabled,
      setDemoMode,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error('useGame must be used within GameProvider');
  return value;
}