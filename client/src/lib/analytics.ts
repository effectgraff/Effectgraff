const CONSENT_KEY = "effectgraff-cookie-consent";
const YANDEX_COUNTER_ID = 111805231;
const YANDEX_SCRIPT_ATTR = "data-effectgraff-yandex";

export type AnalyticsConsent = "accepted" | "rejected";

type YandexMetrica = {
  (...args: unknown[]): void;
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    ym?: YandexMetrica;
  }
}

export const getAnalyticsConsent = (): AnalyticsConsent | null => {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
};

export const setAnalyticsConsent = (consent: AnalyticsConsent) => {
  window.localStorage.setItem(CONSENT_KEY, consent);
};

const installYandexQueue = () => {
  if (typeof window === "undefined") return;
  const existing = window.ym;
  if (existing) return;
  const queue = ((...args: unknown[]) => {
    (queue.a ||= []).push(args);
  }) as YandexMetrica;
  queue.l = Date.now();
  window.ym = queue;
};

const initYandex = () => {
  if (typeof window === "undefined" || !window.ym) return;
  window.ym(YANDEX_COUNTER_ID, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
    defer: true,
  });
};

export const loadAnalytics = () => {
  if (typeof document === "undefined" || getAnalyticsConsent() !== "accepted") return;
  installYandexQueue();
  initYandex();
  if (document.querySelector(`script[${YANDEX_SCRIPT_ATTR}="true"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_COUNTER_ID}`;
  script.dataset.effectgraffYandex = "true";
  document.head.appendChild(script);
};

const ALLOWED_GOALS = new Set([
  "lead_brief_submit",
  "contact_email_click",
  "contact_phone_click",
  "contact_vk_click",
  "crm_success",
  "vk_share",
]);

export const trackAnalyticsEvent = (event: string) => {
  if (getAnalyticsConsent() !== "accepted" || !ALLOWED_GOALS.has(event)) return;
  window.ym?.(YANDEX_COUNTER_ID, "reachGoal", event);
};

export const getYandexCounterId = () => YANDEX_COUNTER_ID;
