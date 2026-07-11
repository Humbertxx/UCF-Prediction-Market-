/**
 * Google Identity Services (GIS) helpers — no extra npm package.
 *
 * Loads https://accounts.google.com/gsi/client and returns an id_token for
 * ``POST /auth/google``.
 */

const viteEnv = (import.meta as { env?: Record<string, string | undefined> }).env;

export const GOOGLE_CLIENT_ID: string =
  viteEnv?.VITE_GOOGLE_CLIENT_ID?.trim() ?? "";

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "continue_with" | "signup_with";
              shape?: "rectangular" | "pill" | "circle" | "square";
              width?: number;
            },
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

export function isGoogleAuthConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID);
}

export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Sign-In requires a browser"));
  }
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity script")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity script"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function renderGoogleSignInButton(
  container: HTMLElement,
  onCredential: (idToken: string) => void,
): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("VITE_GOOGLE_CLIENT_ID is not set");
  }

  await loadGoogleIdentityScript();
  if (!window.google?.accounts?.id) {
    throw new Error("Google Identity Services failed to initialize");
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => {
      if (response.credential) onCredential(response.credential);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  container.innerHTML = "";
  window.google.accounts.id.renderButton(container, {
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "rectangular",
    width: 320,
  });
}
