import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { EMPTY_PROFILE, clearProfile, loadProfile, saveProfile, type Profile } from '@/lib/profile';

type Ctx = {
  profile: Profile;
  /** False until the first read off disk resolves. */
  ready: boolean;
  update: (patch: Partial<Profile>) => void;
  toggleNeed: (id: string) => void;
  toggleSaved: (id: string) => void;
  reset: () => void;
};

const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadProfile().then((p) => {
      if (alive) {
        setProfile(p);
        setReady(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // Persist on change rather than inside each mutator, so no writer can forget.
  // Gated on `ready` so the initial empty state never clobbers stored data.
  useEffect(() => {
    if (!ready) return;
    void saveProfile(profile);
  }, [profile, ready]);

  const update = useCallback(
    (patch: Partial<Profile>) => setProfile((cur) => ({ ...cur, ...patch })),
    [],
  );

  const toggleNeed = useCallback((id: string) => {
    setProfile((cur) => ({
      ...cur,
      needs: cur.needs.includes(id) ? cur.needs.filter((n) => n !== id) : [...cur.needs, id],
    }));
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setProfile((cur) => ({
      ...cur,
      saved: cur.saved.includes(id) ? cur.saved.filter((s) => s !== id) : [...cur.saved, id],
    }));
  }, []);

  const reset = useCallback(() => {
    void clearProfile();
    setProfile(EMPTY_PROFILE);
  }, []);

  const value = useMemo<Ctx>(
    () => ({ profile, ready, update, toggleNeed, toggleSaved, reset }),
    [profile, ready, update, toggleNeed, toggleSaved, reset],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): Ctx {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
