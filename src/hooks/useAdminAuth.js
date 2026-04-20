import { useEffect, useState } from 'react';
import { getCurrentAdmin, signOutAdmin } from '../lib/queries';
import { hasSupabaseEnv, supabase } from '../lib/supabase';

export function useAdminAuth() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdmin = async () => {
    try {
      const currentAdmin = await getCurrentAdmin();
      setAdmin(currentAdmin);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setLoading(false);
      return undefined;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadAdmin();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await signOutAdmin();
    setAdmin(null);
  };

  return {
    admin,
    loading,
    logout,
  };
}
