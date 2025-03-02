"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabaseBrowserClient";
import { checkSubscriptionStatus } from "@/app/actions/checkSubscriptionStatus";

const supabase = createClient();

type AuthContextType = {
  user: User | null;
  loading: boolean;
  subscriptionStatus: string | null;
  refreshSubscriptionStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscriptionStatus: null,
  refreshSubscriptionStatus: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshSubscriptionStatus = async () => {
    try {
      const status = await checkSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (error) {
      console.error("Error refreshing subscription status:", error);
    }
  };

  useEffect(() => {
    if (user) {
      refreshSubscriptionStatus();
    } else {
      setSubscriptionStatus(null);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        subscriptionStatus,
        refreshSubscriptionStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
