const CONSENT_KEY = "effectgraff-cookie-consent";

export type AnalyticsConsent = "accepted" | "rejected";

export const getAnalyticsConsent = (): AnalyticsConsent | null => {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
};

export const setAnalyticsConsent = (consent: AnalyticsConsent) => {
  window.localStorage.setItem(CONSENT_KEY, consent);
};

export const loadAnalytics = () => {
  if (typeof document === "undefined" || getAnalyticsConsent() !== "accepted") return;
  if (document.querySelector('script[data-effectgraff-analytics="true"]')) return;
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
  if (!endpoint || !websiteId) return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = `${endpoint}/umami`;
  script.dataset.websiteId = websiteId;
  script.dataset.effectgraffAnalytics = "true";
  document.head.appendChild(script);
};
