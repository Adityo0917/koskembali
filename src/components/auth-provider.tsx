"use client";

import {
  getUser,
  handleAuthCallback,
  onAuthChange,
  type CallbackResult,
  type User,
} from "@netlify/identity";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type PasswordFlow = { type: "recovery" | "invite"; token?: string } | null;

const AuthContext = createContext<{
  user: User | null;
  ready: boolean;
  callbackError: string;
  passwordFlow: PasswordFlow;
  finishPasswordFlow: () => void;
}>({
  user: null,
  ready: false,
  callbackError: "",
  passwordFlow: null,
  finishPasswordFlow: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [callbackError, setCallbackError] = useState("");
  const [passwordFlow, setPasswordFlow] = useState<PasswordFlow>(null);
  const callback = useRef<Promise<CallbackResult | null> | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthChange((_event, currentUser) => {
      if (active) {
        setUser(currentUser);
        setCallbackError("");
      }
    });

    async function initialize() {
      try {
        callback.current ??= handleAuthCallback();
        const result = await callback.current;
        const currentUser = await getUser();
        if (!active) return;
        setUser(currentUser);
        if (result?.type === "recovery" || result?.type === "invite") {
          setPasswordFlow({ type: result.type, token: result.token });
          router.replace("/login");
        }
      } catch {
        if (active) {
          setCallbackError("Tautan masuk tidak valid atau sudah kedaluwarsa. Coba masuk atau minta tautan baru.");
          router.replace("/login");
        }
      } finally {
        if (active) setReady(true);
      }
    }

    void initialize();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, ready, callbackError, passwordFlow, finishPasswordFlow: () => setPasswordFlow(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
