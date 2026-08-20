/*
  EffectGraff Rebuild — page style reminder:
  Treat the site as a confident street-art studio dossier: decisive typography,
  real wall imagery, clear commercial pathways, and an editorial archive that never
  hides the work behind interface chrome.
*/
import { useAuth } from "@/_core/hooks/useAuth";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Mail, Menu, MoveUpRight, X } from "lucide-react";
import { getAnalyticsConsent, loadAnalytics, setAnalyticsConsent, trackAnalyticsEvent, type AnalyticsConsent } from "@/lib/analytics";
import { trpc } from "@/lib/trpc";

type ImageRecord = {
  src: string;
  title: string;
  meta: string;
  tag: string;
  size: "wide" | "tall" | "standard";
  isWall?: boolean;
};

type Language = "ru" | "en";

const mediaUrl = (path: string) => {
  if (typeof window !== "undefined" && window.location.hostname.endsWith("effectgraff.ru")) {
    return `https://www.effectgraff.ru/manus-storage/${path}`;
  }
  return `/manus-storage/${path}`;
};

function VkNewsCard({ language }: { language: Language }) {
  return <a className="vk-news-card" href="https://vk.ru/effectgraff" target="_blank" rel="noreferrer" onClick={() => trackLeadEvent("vk_profile_click", { placement: "community_news_card", language })} aria-label={language === "en" ? "Open the EffectGraff VK community" : "Открыть группу EffectGraff во ВКонтакте"}>
    <div className="vk-card-topline"><span>04 / {language === "en" ? "COMMUNITY NEWS" : "НОВОСТИ ГРУППЫ"}</span><span>VK / EFFECTGRAFF</span></div>
    <div className="vk-card-body"><div><span className="vk-card-kicker">{language === "en" ? "FOLLOW THE TRACE" : "СЛЕДИТЕ ЗА СЛЕДОМ"}</span><h3>{language === "en" ? <>Fresh work.<br /><em>Direct from the wall.</em></> : <>Свежие работы.<br /><em>Прямо со стены.</em></>}</h3><p>{language === "en" ? "Announcements, festival news and new EffectGraff publications live in our official VK community." : "Анонсы, фестивальные новости и новые публикации EffectGraff — в нашей официальной группе VK."}</p><span className="vk-card-action">{language === "en" ? "OPEN VK COMMUNITY" : "ОТКРЫТЬ ГРУППУ VK"} <ArrowUpRight size={17} /></span></div><div className="vk-card-mark" aria-hidden="true"><span>VK</span><small>212505805<br />PUBLIC TRACE</small></div></div>
  </a>;
}

const translate = (language: Language, ru: string, en: string) => language === "en" ? en : ru;

const trackLeadEvent = (event: string, data: Record<string, string> = {}) => {
  const tracker = (window as unknown as { umami?: { track?: (name: string, properties?: Record<string, string>) => void } }).umami;
  tracker?.track?.(event, data);
  trackAnalyticsEvent(event);
};

const formatRussianPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  if (!digits) return "";
  const normalized = digits.startsWith("7") ? digits : `7${digits}`.slice(0, 11);
  const rest = normalized.slice(1);
  let result = "+7";
  if (rest.length) result += ` (${rest.slice(0, 3)}`;
  if (rest.length >= 3) result += ")";
  if (rest.length > 3) result += ` ${rest.slice(3, 6)}`;
  if (rest.length > 6) result += `-${rest.slice(6, 8)}`;
  if (rest.length > 8) result += `-${rest.slice(8, 10)}`;
  return result;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const phonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

const featuredImages: ImageRecord[] = [
  { src: mediaUrl("page-02_1604826d.webp"), title: "ВОДА КАМЕНЬ ТОЧИТ", meta: "01 / УЛАН-УДЭ · 2019", tag: "Фестиваль «Бурятия в красках»", size: "wide" },
  { src: mediaUrl("page-05_8f0a7114.webp"), title: "Оформление скейт-парка", meta: "02 / НОЯБРЬСК · 2020", tag: "Проект по инициативе местных НКО", size: "tall" },
  { src: mediaUrl("page-07_4164bd5e.webp"), title: "Коктебель", meta: "03 / КОКТЕБЕЛЬ", tag: "В рамках фестиваля «Щит Кафы»", size: "standard" },
  { src: mediaUrl("page-08_b1faf415.webp"), title: "THE SEED", meta: "04 / САНКТ-ПЕТЕРБУРГ · 2020", tag: "Фестиваль «Уличная Россия»", size: "standard" },
  { src: mediaUrl("page-10_b7dc6ffb.webp"), title: "ШОРСКИЙ ШАМАН", meta: "05 / ШЕРЕГЕШ · 2021", tag: "Фестиваль «Окрашено»", size: "wide" },
  { src: mediaUrl("page-14_d3cc171c.webp"), title: "ЦАРЬ ПУТЕЙ", meta: "06 / ЗИМА · 2021", tag: "Фестиваль Energy Nation", size: "standard" },
  { src: mediaUrl("page-17_9cc55f2f.webp"), title: "683002", meta: "07 / ПЕТРОПАВЛОВСК-КАМЧАТСКИЙ · 2022", tag: "Камчатка", size: "tall" },
  { src: mediaUrl("page-21_c54060e5.webp"), title: "В ГОРЫ КАК ДОМОЙ / СНОУБОРД — ФИШКА КАМЧАТКИ / МОМЕНТ / АКВАТОРИЯ", meta: "08 / ПЕТРОПАВЛОВСК-КАМЧАТСКИЙ · 2023", tag: "Серия фасадов", size: "wide" },
  { src: mediaUrl("page-25_479c2f9d.webp"), title: "У ЛИС", meta: "09 / ВЛАДИВОСТОК · МЫС ЧУМАКА · 2023", tag: "Открытая стена", size: "wide" },
  { src: mediaUrl("page-30_8eaf99a8.webp"), title: "DAKING jam", meta: "10 / DAKING JAM · 2023", tag: "DAKING jam", size: "standard" },
  { src: mediaUrl("page-31_7885a7f0.webp"), title: "СО СВОИМ САМОВАРОМ / 2", meta: "11 / SANTIAGO · 2023", tag: "Santiago", size: "wide" },
];

const archiveImages: ImageRecord[] = [
  ...featuredImages,
  ...[1, 3, 4, 6, 9, 11, 12, 13, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28, 29, 32].map((page) => ({
    src: mediaUrl(`page-${String(page).padStart(2, "0")}_${({ 1: "d1846c42", 3: "bacd3d99", 4: "e392702e", 6: "bf4d4243", 9: "3513f603", 11: "b5cd0c17", 12: "2f383203", 13: "8fee6b3e", 15: "81b33e37", 16: "cf8aefd0", 18: "dcc9bd0b", 19: "feb486c8", 20: "92e7aee6", 22: "7f808007", 23: "9817fab5", 24: "152faa32", 26: "d51bef29", 27: "2ff25cdd", 28: "04265831", 29: "fc71143c", 32: "9c47dea4" } as Record<number, string>)[page]}.webp`),
    title: `ПОРТФОЛИО / СТРАНИЦА ${String(page).padStart(2, "0")}`,
    meta: `ПОЛНЫЙ АРХИВ / ${String(page).padStart(2, "0")} / 32`,
    tag: "PDF-портфолио EffectGraff",
    size: page % 3 === 0 ? "wide" : page % 3 === 1 ? "tall" : "standard",
  } as ImageRecord)),
];

const wallImages: ImageRecord[] = [
  ["img_2012_afd076d4.webp", "IMG_2012", "wide"], ["img_0902_9defacfc.webp", "IMG_0902", "tall"], ["img_0050_64280455.webp", "IMG_0050", "standard"], ["img_0048_5da59892.webp", "IMG_0048", "standard"], ["img_9871_d3e27bf7.webp", "IMG_9871", "wide"], ["img_9870_b2dc4dd1.webp", "IMG_9870", "tall"], ["img_9869_aa2d78c9.webp", "IMG_9869", "standard"], ["img_9640_cd148dba.webp", "IMG_9640", "wide"], ["img_9410_dcc51000.webp", "IMG_9410", "standard"], ["img_8540_259bc694.webp", "IMG_8540", "tall"], ["img_4968_30dda908.webp", "IMG_4968", "wide"], ["img_4349_c12d1ad0.webp", "IMG_4349", "standard"], ["wall-13_b8152dfe.webp", "IMG_3190", "wide"], ["wall-14_3e8aff30.webp", "IMG_2798", "tall"], ["wall-15_5dd13029.webp", "IMG_1383", "standard"], ["wall-16_9d29590e.webp", "IMG_3030", "wide"], ["wall-17_9e6da7a8.webp", "IMG_9893", "standard"], ["wall-18_1f7e75c6.webp", "IMG_9892", "tall"], ["wall-19_6d9102d9.webp", "IMG_9891", "standard"], ["wall-20_c4331798.webp", "IMG_9890", "wide"], ["wall-21_87bcb05b.webp", "IMG_5428", "standard"], ["wall-22_1e64c7aa.webp", "IMG_5397", "tall"], ["wall-23_e5892aa7.webp", "IMG_2888", "wide"], ["wall-24_aec188b4.webp", "IMG_2315", "standard"], ["wall-25_743854ee.webp", "IMG_1765", "tall"], ["wall-26_bbf4ef93.webp", "IMG_1732", "standard"], ["wall-27_ecda59ba.webp", "IMG_1269", "wide"], ["wall-28_d6c4056c.webp", "IMG_2065", "standard"], ["wall-29_5966e3f4.webp", "IMG_6164", "tall"], ["wall-30_046415f4.webp", "8504F9D6", "wide"], ["wall-31_8c20bf6e.webp", "IMG_9889", "standard"], ["wall-32_5a587b3d.webp", "IMG_6178", "tall"], ["wall-33_011cb483.webp", "IMG_6181", "standard"], ["wall-34_5a125500.webp", "IMG_6179", "wide"],
].map(([file, _label, size], index) => ({ src: mediaUrl(file), title: "СТЕНА", meta: `СТЕНЫ / ${String(index + 1).padStart(2, "0")} / 34`, tag: "Пользовательский архив EffectGraff", size: size as ImageRecord["size"], isWall: true }));

const filters = ["Избранное", "Стены", "Полный архив"];
const services = [
  { index: "01", title: "Коммерческие стены", titleEn: "Commercial walls", text: "Муралы, фасады, кафе, скейт-парки и пространства, которым нужен собственный голос.", textEn: "Murals, facades, cafés, skate parks and spaces that need a voice of their own.", accent: "РОСПИСЬ / MURAL", accentEn: "PAINT / MURAL" },
  { index: "02", title: "Фестивали и open calls", titleEn: "Festivals & open calls", text: "Шесть авторов, четыре города и опыт работы с фестивальными форматами и открытыми стенами.", textEn: "Six artists, four cities and experience with festivals, open walls and international calls.", accent: "ФЕСТИВАЛЬ / CALL", accentEn: "FESTIVAL / CALL" },
  { index: "03", title: "Коллаборации", titleEn: "Collaborations", text: "Кураторские проекты, бренды и городские инициативы — от первой идеи до финального слоя.", textEn: "Curated projects, brands and city initiatives — from the first idea to the final layer.", accent: "СВЯЗАТЬ / BUILD", accentEn: "CONNECT / BUILD" },
];

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [language, setLanguage] = useState<Language>(() => { const requested = new URLSearchParams(window.location.search).get("lang"); return requested === "en" || requested === "ru" ? requested : ((localStorage.getItem("effectgraff-language") as Language) || "ru"); });
  const [cookieConsent, setCookieConsent] = useState<AnalyticsConsent | null>(() => getAnalyticsConsent());
  const [activeFilter, setActiveFilter] = useState("Избранное");
  const [activeImage, setActiveImage] = useState<ImageRecord | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [briefStatus, setBriefStatus] = useState("");
  const [briefSuccess, setBriefSuccess] = useState(false);
  const [briefErrors, setBriefErrors] = useState<Record<string, string>>({});
  const [contactMethod, setContactMethod] = useState<"phone" | "email">("phone");
  const [brief, setBrief] = useState({ city: "", contact: "", wallSize: "", budget: "", projectType: "", timing: "", details: "" });
  const [briefConsent, setBriefConsent] = useState(false);
  const createLeadMutation = trpc.leads.create.useMutation({
    onSuccess: () => {
      trackLeadEvent("brief_submit_valid", { language, contact_method: contactMethod });
      setBriefStatus(tr("Заявка сохранена — мы свяжемся с вами по указанному контакту.", "Your brief has been saved — we will contact you using the details provided."));
      setBriefSuccess(true);
      setBriefConsent(false);
    },
    onError: () => {
      setBriefStatus(tr("Не удалось сохранить заявку. Попробуйте ещё раз или напишите нам на Effectgraff@yandex.ru.", "We could not save the brief. Please try again or email Effectgraff@yandex.ru."));
    },
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visibleImages = useMemo(() => activeFilter === "Стены" ? wallImages : activeFilter === "Полный архив" ? archiveImages : featuredImages, [activeFilter]);
  const tr = (ru: string, en: string) => translate(language, ru, en);
  const vkShareHref = `https://vk.com/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(language === "en" ? "EffectGraff — graffiti artists for walls and festivals" : "EffectGraff — граффити-художники для стен и фестивалей")}`;
  useEffect(() => { if (cookieConsent === "accepted") loadAnalytics(); }, [cookieConsent]);
  const chooseCookieConsent = (consent: AnalyticsConsent) => { setAnalyticsConsent(consent); setCookieConsent(consent); if (consent === "accepted") loadAnalytics(); };
  const changeLanguage = (next: Language) => { setLanguage(next); localStorage.setItem("effectgraff-language", next); trackLeadEvent("language_switch", { language: next }); };
  useEffect(() => {
    document.documentElement.lang = language;
    const isExplicitEnglishUrl = new URLSearchParams(window.location.search).get("lang") === "en";
    const canonicalUrl = `https://effectport-5rhal3bg.manus.space/${isExplicitEnglishUrl ? "?lang=en" : ""}`;
    document.title = language === "en" ? "EffectGraff — Graffiti Artists for Walls, Murals & Festivals" : "EffectGraff — Граффити-художники для стен, муралов и фестивалей";
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonicalUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonicalUrl);
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", language === "en" ? "en_GB" : "ru_RU");
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute("content", language === "en" ? "EffectGraff is a six-artist graffiti collective from Russia creating commercial walls, murals, festival pieces and international collaborations." : "EffectGraff — коллектив из шести граффити-художников для коммерческих стен, муралов, фестивалей и open calls.");
  }, [language]);

  const requiredBriefFields = [{ key: "city", label: tr("город", "city") }, { key: "contact", label: tr("контакты", "contact") }, { key: "wallSize", label: tr("размер стены", "wall size") }, { key: "budget", label: tr("ожидаемый бюджет", "expected budget") }] as const;
  const updateBrief = (field: keyof typeof brief, value: string) => {
    setBrief((current) => ({ ...current, [field]: value }));
    setBriefErrors((current) => { if (!current[field]) return current; const next = { ...current }; delete next[field]; return next; });
  };
  const changeContactMethod = (method: "phone" | "email") => {
    setContactMethod(method);
    setBrief((current) => ({ ...current, contact: "" }));
    setBriefErrors((current) => { const next = { ...current }; delete next.contact; return next; });
  };
  const updateContact = (value: string) => updateBrief("contact", contactMethod === "phone" ? formatRussianPhone(value) : value);

  const submitBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Record<string, string> = Object.fromEntries(requiredBriefFields.filter(({ key }) => !brief[key].trim()).map(({ key, label }) => [key, language === "en" ? `Please enter your ${label}.` : `Укажите ${label}.`]));
    const contact = brief.contact.trim();
    if (contact && !errors.contact) {
      if (contactMethod === "email" && !emailPattern.test(contact)) errors.contact = tr("Введите корректный email, например name@example.com.", "Enter a valid email, for example name@example.com.");
      if (contactMethod === "phone" && !phonePattern.test(contact)) errors.contact = tr("Введите телефон в формате +7 (999) 123-45-67.", "Enter a phone number in the format +7 (999) 123-45-67.");
    }
    if (!briefConsent) errors.consent = tr("Подтвердите согласие на обработку заявки.", "Please confirm your consent to process this brief.");
    if (Object.keys(errors).length > 0) {
      setBriefErrors(errors);
      setBriefStatus(tr("Проверьте обязательные поля — письмо пока не подготовлено.", "Please check the required fields — the email has not been prepared."));
      const firstInvalid = requiredBriefFields.find(({ key }) => errors[key]);
      document.getElementById(`brief-${firstInvalid?.key}`)?.focus();
      return;
    }
    setBriefErrors({});
    trackLeadEvent("brief_submit", { language, contact_method: contactMethod });
    createLeadMutation.mutate({
      city: brief.city.trim(),
      contact: brief.contact.trim(),
      wallSize: brief.wallSize.trim(),
      budget: brief.budget.trim(),
      projectType: brief.projectType.trim() || undefined,
      timing: brief.timing.trim() || undefined,
      details: brief.details.trim() || undefined,
      language,
      consent: true,
    });
  };

  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); setMenuOpen(false); };
  const toggleAudio = async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) { try { await audioRef.current.play(); setIsPlaying(true); } catch { setIsPlaying(false); } }
    else { audioRef.current.pause(); setIsPlaying(false); }
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <button className="brand-lockup" onClick={() => scrollTo("top")} aria-label="EffectGraff — наверх"><span className="brand-mark"><img src={mediaUrl("eg-club-logo-1_42f150e4.png")} alt="" /></span><span className="brand-word">EFFECT<span>GRAFF</span></span></button>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label={tr("Основная навигация", "Main navigation")}><button onClick={() => scrollTo("work")}>{tr("Работы", "Work")}</button><button onClick={() => scrollTo("services")}>{tr("Для проектов", "For projects")}</button><button onClick={() => scrollTo("collective")}>{tr("Команда", "Collective")}</button><button onClick={() => scrollTo("contact")}>{tr("Контакт", "Contact")}</button></nav>
        <div className="language-switcher" role="group" aria-label="Language"><button className={language === "ru" ? "active" : ""} onClick={() => changeLanguage("ru")} aria-pressed={language === "ru"}>RU</button><button className={language === "en" ? "active" : ""} onClick={() => changeLanguage("en")} aria-pressed={language === "en"}>EN</button></div>
        <button className="menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label={tr("Открыть меню", "Open menu")}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>

      <audio ref={audioRef} loop preload="none" src={mediaUrl("effectgraff-calm-ethno-loop_ebebb5c1.wav")} />
      <button className={`sound-toggle ${isPlaying ? "is-playing" : ""}`} onClick={toggleAudio} aria-pressed={isPlaying} aria-label={isPlaying ? "Выключить фоновую музыку" : "Включить фоновую музыку"}><span className="sound-bars" aria-hidden="true"><i /><i /><i /></span><span>{isPlaying ? tr("ЗВУК ВКЛ", "SOUND ON") : tr("ВКЛЮЧИТЬ ЛУП", "PLAY LOOP")}</span></button>
      <a className="floating-cta" onClick={() => trackLeadEvent("cta_click", { placement: "floating", language })} href="mailto:Effectgraff@yandex.ru?subject=EffectGraff%20—%20discuss%20a%20project" aria-label={tr("Обсудить проект с EffectGraff", "Discuss a project with EffectGraff")}><span className="cta-pulse" /> <span>{tr("ОБСУДИТЬ ПРОЕКТ", "DISCUSS PROJECT")}</span><ArrowUpRight size={16} /></a>
      {cookieConsent === null && <aside className="cookie-banner" role="dialog" aria-label={tr("Согласие на аналитику", "Analytics consent")}><div><strong>{tr("Файлы cookie и аналитика", "Cookies and analytics")}</strong><p>{tr("Мы используем обезличенную аналитику, чтобы понимать посещаемость и улучшать сайт. Выберите, разрешить ли её.", "We use privacy-friendly analytics to understand visits and improve the site. Choose whether to allow it.")}</p><a href={language === "en" ? "/privacy-en.html" : "/privacy.html"}>{tr("Подробнее в политике конфиденциальности", "Read the privacy policy")}</a></div><div className="cookie-actions"><button type="button" className="cookie-reject" onClick={() => chooseCookieConsent("rejected")}>{tr("Отклонить", "Reject")}</button><button type="button" className="cookie-accept" onClick={() => chooseCookieConsent("accepted")}>{tr("Принять", "Accept")}</button></div></aside>}

      <main id="top">
        <section className="hero-section">
          <div className="hero-grid-note">EG / STUDIO<br />FIELD WORKS<br />2012—2023</div>
          <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> {tr("КОЛЛЕКТИВ / 06 АВТОРОВ", "COLLECTIVE / 06 ARTISTS")}</div><h1>{language === "en" ? <>The city<br /><em>speaks.</em><br />We leave a mark.</> : <>Город<br /><em>говорит.</em><br />Мы оставляем след.</>}</h1><p className="hero-intro">{tr("EffectGraff — шесть граффити-художников из Санкт-Петербурга, Нижневартовска, Красноярска и Владивостока. Коммерческие стены, муралы, фестивали и проекты, которые остаются в городе.", "EffectGraff is a collective of six graffiti artists from Saint Petersburg, Nizhnevartovsk, Krasnoyarsk and Vladivostok. Commercial walls, murals, festivals and projects that stay in the city.")}</p><div className="hero-actions"><button className="primary-action" onClick={() => { trackLeadEvent("cta_click", { placement: "hero", language }); scrollTo("contact"); }}>{tr("Обсудить стену", "Discuss a wall")} <ArrowUpRight size={17} /></button><button className="text-link" onClick={() => scrollTo("work")}>{tr("Смотреть архив", "View archive")} <ArrowDownRight size={17} /></button></div></div>
          <div className="hero-visual"><div className="hero-wash" /><div className="hero-image-wrap"><img src={mediaUrl("page-02_1604826d.webp")} alt="Мурал EffectGraff на городской стене" /><div className="hero-scan-layer" aria-hidden="true" /><div className="registration-mark" aria-hidden="true"><span /><span /></div><div className="hero-stamp"><b>EG—01</b><br /><span>STREET<br />ARCHIVE</span></div><div className="eg-seal" aria-hidden="true"><img src={mediaUrl("eg-club-logo-1_42f150e4.png")} alt="" /><small>FIELD<br />NOTE</small></div></div><div className="hero-side-note">55°45′N<br />37°37′E</div></div>
          <div className="hero-footer-note"><span>НЕ МУЗЕЙ.</span> НЕ ФОН. / ЖИВАЯ СТЕНА.</div>
        </section>

        <section className="proof-strip" aria-label={tr("EffectGraff в цифрах", "EffectGraff in numbers")}><div><strong>06</strong><span>{tr("ХУДОЖНИКОВ", "ARTISTS")}</span></div><div><strong>04</strong><span>{tr("ГОРОДА", "CITIES")}</span></div><div><strong>34</strong><span>{tr("СТЕНЫ В АРХИВЕ", "WALLS ARCHIVED")}</span></div><div><strong>01</strong><span>{tr("ОБЩИЙ СЛЕД", "ONE COLLECTIVE MARK")}</span></div></section>

        <section className="services-section" id="services"><div className="section-intro"><div className="section-index">01 / {tr("ДЛЯ ПРОЕКТОВ", "FOR PROJECTS")}</div><h2>{language === "en" ? <>Not just<br /><em>paint.</em></> : <>Не просто<br /><em>покрасим.</em></>}</h2><p>{tr("Собираем команду под задачу, считываем место и превращаем поверхность в событие. Сразу говорим о масштабе, сроках и результате.", "We build the right team, read the place and turn a surface into an event. Clear scope, timing and outcomes from the start.")}</p></div><div className="services-list">{services.map((service) => <article className="service-card" key={service.index}><span className="service-number">{service.index}</span><div><span className="service-accent">{language === "en" ? service.accentEn : service.accent}</span><h3>{language === "en" ? service.titleEn : service.title}</h3><p>{language === "en" ? service.textEn : service.text}</p></div><ArrowUpRight size={20} /></article>)}</div></section>

        <section className="collective-section" id="collective"><div className="collective-index">02 / {tr("КОМАНДА", "COLLECTIVE")}</div><div className="collective-main"><p className="manifesto-kicker">САНКТ-ПЕТЕРБУРГ / НИЖНЕВАРТОВСК / КРАСНОЯРСК / ВЛАДИВОСТОК</p><h2>{language === "en" ? <>Every wall<br /><span>has a voice.</span></> : <>Каждая стена<br /><span>имеет голос.</span></>}</h2><div className="collective-copy"><p>{tr("Мы соединяем личный почерк и коллективную композицию, чтобы превращать обычные поверхности в места встречи.", "We combine individual handwriting with collective composition to turn ordinary surfaces into places where people meet.")}</p><p>{tr("В работе ценим честное место, ясную задачу и след, который не хочется закрашивать. Открыты к фестивалям, локальным сообществам и международным open calls.", "We value an honest place, a clear brief and a mark nobody wants to paint over. Open to festivals, local communities and international open calls.")}</p></div><div className="artist-roll"><span>EG / 06 ARTISTS</span><span>THE WALL REMEMBERS</span></div></div><div className="collective-mark">EG<br /><small>06 / 04 / ∞</small></div></section>

        <section className="archive-section" id="work"><div className="archive-heading"><div><div className="section-index">03 / {tr("РЕАЛЬНЫЕ РАБОТЫ", "SELECTED WORK")}</div><h2>{language === "en" ? <>Field<br /><em>archive.</em></> : <>Полевой<br /><em>архив.</em></>}</h2></div><p>{tr("Избранные проекты, пользовательские стены и полный PDF-архив. Нажмите на изображение, чтобы открыть поверхность ближе.", "Selected projects, user-submitted walls and the complete PDF archive. Open any image to get closer to the surface.")}</p></div><div className="filter-row" role="tablist" aria-label={tr("Категории архива", "Archive categories")}>{filters.map((filter) => <button key={filter} className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter)} role="tab" aria-selected={activeFilter === filter}>{filter === "Избранное" ? tr("Избранное", "Selected") : filter === "Стены" ? tr("Стены", "Walls") : tr("Полный архив", "Full archive")}<span>{filter === "Стены" ? "34" : filter === "Полный архив" ? "32" : "11"}</span></button>)}</div><div className="archive-context"><span>{(activeFilter === "Избранное" ? tr("Избранное", "SELECTED") : activeFilter === "Стены" ? tr("Стены", "WALLS") : tr("Полный архив", "FULL ARCHIVE")).toUpperCase()}</span><span>{visibleImages.length} MATERIALS / OPEN TO VIEW</span></div><div className="gallery-grid">{visibleImages.map((image, index) => <button key={image.src} className={`gallery-item ${image.size}`} onClick={() => setActiveImage(image)} aria-label={`${tr("Открыть работу", "Open work")}: ${image.title}`}><div className="gallery-image"><img src={image.src} alt={image.title} loading={activeFilter === "Избранное" ? "eager" : index > 2 ? "lazy" : "eager"} decoding="async" /><span className="gallery-code">EG / {String(index + 1).padStart(2, "0")}</span><span className="gallery-hover"><MoveUpRight size={22} /></span></div>{image.isWall ? <div className="gallery-caption wall-caption"><strong>СТЕНА</strong></div> : <div className="gallery-caption"><span>{image.meta}</span><strong>{image.title}</strong><small>{image.tag}</small></div>}</button>)}</div></section>

        <section className="vk-news-section" id="vk-news"><div className="vk-news-heading"><div><div className="section-index">04 / {tr("НОВОСТИ ГРУППЫ", "COMMUNITY NEWS")}</div><h2>{language === "en" ? <>Fresh<br /><em>from VK.</em></> : <>Свежий<br /><em>след.</em></>}</h2></div><p>{tr("Последние новости, события и новые публикации EffectGraff — прямо из нашей официальной группы VK.", "Latest EffectGraff news, events and new posts — directly from our official VK community.")}</p></div><VkNewsCard language={language} /></section>

        <section className="contact-section" id="contact"><div className="contact-rail"><span>05 / {tr("СВЯЗАТЬСЯ", "CONTACT")}</span><span>OPEN FOR WALLS</span></div><div className="contact-content"><p className="eyebrow"><span className="eyebrow-line" /> {tr("СОБЕРЁМ СЛЕД", "MAKE A MARK")}</p><h2>{language === "en" ? <>Have a wall?<br /><em>Let's talk.</em></> : <>Есть стена?<br /><em>Поговорим.</em></>}</h2><p>{tr("Напишите, где находится стена, какой масштаб и срок, а также что вы хотите на ней услышать. Ответим с идеей и следующим шагом.", "Tell us where the wall is, its scale and timeline, and what you want it to say. We will come back with an idea and a clear next step.")}</p><div className="brief-grid"><span>01 / {tr("ЛОКАЦИЯ", "LOCATION")}</span><span>02 / {tr("СРОК", "TIMELINE")}</span><span>03 / {tr("ЗАДАЧА", "BRIEF")}</span></div><div className="contact-links"><a className="contact-main-link" onClick={() => trackLeadEvent("email_click", { placement: "contact_section", language })} href={`mailto:Effectgraff@yandex.ru?subject=${encodeURIComponent(language === "en" ? "EffectGraff — project" : "EffectGraff — проект")}`}><Mail size={18} /> Effectgraff@yandex.ru <ArrowUpRight size={16} /></a><a onClick={() => trackLeadEvent("phone_click", { placement: "contact_section", language })} href="tel:+79955901063">+7 (995) 590-10-63</a><a onClick={() => trackLeadEvent("vk_profile_click", { placement: "contact_section", language })} href="https://vk.ru/effectgraff" target="_blank" rel="noreferrer">VK / @effectgraff</a></div><form className="brief-form" onSubmit={submitBrief} noValidate><div className="brief-form-head"><span>{language === "en" ? "BRIEF / 01" : "БРИФ / 01"}</span><strong>{tr("Расскажите о стене", "Tell us about the wall")}</strong><small>{tr("Поля со звёздочкой обязательны. Данные не сохраняются на сайте — письмо отправляется через вашу почтовую программу.", "Starred fields are required. Data is not stored on this website — the message opens in your email app.")}</small></div><div className="brief-form-grid"><label><span>{tr("Город", "City")} *</span><input id="brief-city" aria-invalid={Boolean(briefErrors.city)} aria-describedby={briefErrors.city ? "brief-city-error" : undefined} value={brief.city} onChange={(event) => updateBrief("city", event.target.value)} placeholder={tr("Например, Владивосток", "e.g. London")} />{briefErrors.city && <small id="brief-city-error" className="field-error">{briefErrors.city}</small>}</label><label><span>{tr("Контакты", "Contact")} *</span><div className="contact-method-toggle" role="radiogroup" aria-label={tr("Способ связи", "Contact method")}><button type="button" className={contactMethod === "phone" ? "active" : ""} onClick={() => changeContactMethod("phone")} role="radio" aria-checked={contactMethod === "phone"}>{tr("Телефон", "Phone")}</button><button type="button" className={contactMethod === "email" ? "active" : ""} onClick={() => changeContactMethod("email")} role="radio" aria-checked={contactMethod === "email"}>Email</button></div><input id="brief-contact" type={contactMethod === "email" ? "email" : "tel"} inputMode={contactMethod === "email" ? "email" : "tel"} autoComplete={contactMethod === "email" ? "email" : "tel"} aria-invalid={Boolean(briefErrors.contact)} aria-describedby={briefErrors.contact ? "brief-contact-error" : undefined} value={brief.contact} onChange={(event) => updateContact(event.target.value)} placeholder={contactMethod === "phone" ? "+7 (999) 123-45-67" : "name@example.com"} />{briefErrors.contact && <small id="brief-contact-error" className="field-error">{briefErrors.contact}</small>}</label><label><span>{tr("Размер стены", "Wall size")} *</span><input id="brief-wallSize" aria-invalid={Boolean(briefErrors.wallSize)} aria-describedby={briefErrors.wallSize ? "brief-wallSize-error" : undefined} value={brief.wallSize} onChange={(event) => updateBrief("wallSize", event.target.value)} placeholder={tr("Например, 12 × 8 м", "e.g. 12 × 8 m")} />{briefErrors.wallSize && <small id="brief-wallSize-error" className="field-error">{briefErrors.wallSize}</small>}</label><label><span>{tr("Ожидаемый бюджет", "Expected budget")} *</span><input id="brief-budget" aria-invalid={Boolean(briefErrors.budget)} aria-describedby={briefErrors.budget ? "brief-budget-error" : undefined} value={brief.budget} onChange={(event) => updateBrief("budget", event.target.value)} placeholder={tr("Например, 300 000 ₽", "e.g. €8,000")} />{briefErrors.budget && <small id="brief-budget-error" className="field-error">{briefErrors.budget}</small>}</label><label><span>{tr("Тип проекта", "Project type")}</span><select value={brief.projectType} onChange={(event) => updateBrief("projectType", event.target.value)}><option value="">{tr("Выберите формат", "Choose a format")}</option><option>{tr("Коммерческая роспись", "Commercial wall")}</option><option>{tr("Мурал / фасад", "Mural / facade")}</option><option>Festival / open call</option><option>{tr("Коллаборация", "Collaboration")}</option><option>{tr("Другое", "Other")}</option></select></label><label><span>{tr("Желаемые сроки", "Timeline")}</span><input value={brief.timing} onChange={(event) => updateBrief("timing", event.target.value)} placeholder={tr("Месяц или дедлайн", "Month or deadline")} /></label></div><label className="brief-details"><span>{tr("Что нужно сделать", "What needs to be done")}</span><textarea value={brief.details} onChange={(event) => updateBrief("details", event.target.value)} placeholder={tr("Коротко опишите задачу, поверхность или пожелания", "Briefly describe the wall, surface or idea")} rows={4} /></label><label className={`brief-consent ${briefErrors.consent ? "has-error" : ""}`}><input type="checkbox" checked={briefConsent} onChange={(event) => { setBriefConsent(event.target.checked); setBriefErrors((current) => { const next = { ...current }; delete next.consent; return next; }); }} /><span>{tr("Я согласен на обработку заявки для связи по проекту и ознакомился с политикой конфиденциальности.", "I consent to processing this brief for project communication and have read the privacy policy.")}</span></label>{briefErrors.consent && <small className="field-error">{briefErrors.consent}</small>}<button className="brief-submit" type="submit" disabled={createLeadMutation.isPending}>{tr("Собрать письмо", "Prepare email")} <ArrowUpRight size={17} /></button>{briefStatus && <p className="brief-status" aria-live="polite">{briefStatus}</p>}<p className="brief-privacy">{tr("Заявка сохраняется во внутренней CRM EffectGraff. Аналитика не получает содержимое формы.", "The brief is saved in EffectGraff's internal CRM. Analytics does not receive form contents.")} <a href={language === "en" ? "/privacy-en.html" : "/privacy.html"}>{tr("Политика конфиденциальности", "Privacy policy")}</a>.</p></form>{briefSuccess && <div className="brief-success" role="dialog" aria-modal="true" aria-labelledby="brief-success-title"><div className="brief-success-card"><button className="brief-success-close" type="button" onClick={() => setBriefSuccess(false)} aria-label={tr("Закрыть окно благодарности", "Close confirmation")}><X size={18} /></button><span className="brief-success-index">{language === "en" ? "EG / BRIEF RECEIVED" : "EG / БРИФ ПРИНЯТ"}</span><div className="brief-success-mark">✓</div><h3 id="brief-success-title">{language === "en" ? <>Thank you.<br /><em>The mark has begun.</em></> : <>Спасибо.<br /><em>След уже начат.</em></>}</h3><p>{tr("Заявка сохранена во внутренней CRM EffectGraff. Мы свяжемся с вами по указанному контакту и вернёмся со следующим шагом по проекту.", "Your brief is saved in the EffectGraff internal CRM. We will contact you using the details provided and return with the next step for your project.")}</p><button className="brief-success-action" type="button" onClick={() => setBriefSuccess(false)}>{tr("Вернуться к сайту", "Back to site")} <ArrowDownRight size={16} /></button></div></div>}</div><div className="contact-mark"><div className="stamp-stack"><img src={mediaUrl("eg-club-logo-1_42f150e4.png")} alt="EffectGraff" /><span>EG / 04</span></div><span>LET THE WALL SPEAK</span></div></section>
      </main>

      <footer className="site-footer"><span>© EFFECTGRAFF / 2023—2026</span><a className="vk-share-link" onClick={() => trackLeadEvent("vk_share", { language })} href={vkShareHref} target="_blank" rel="noreferrer" aria-label={tr("Поделиться сайтом во ВКонтакте", "Share the site on VK")}>VK / {tr("ПОДЕЛИТЬСЯ", "SHARE")}</a><span className="footer-legal"><a href={language === "en" ? "/privacy-en.html" : "/privacy.html"}>{tr("Конфиденциальность", "Privacy")}</a><a href={language === "en" ? "/terms-en.html" : "/terms.html"}>{tr("Правовая информация", "Legal")}</a></span><span>{tr("MADE IN THE CITY / WITH PAINT", "MADE IN THE CITY / WITH PAINT")}</span><button onClick={() => scrollTo("top")} aria-label={tr("Вернуться наверх", "Back to top")}>↑</button></footer>
      {activeImage && <div className="lightbox" role="dialog" aria-modal="true" aria-label={activeImage.title} onClick={() => setActiveImage(null)}><button className="lightbox-close" onClick={() => setActiveImage(null)} aria-label={tr("Закрыть", "Close")}><X size={22} /></button><div className="lightbox-inner" onClick={(event) => event.stopPropagation()}><img src={activeImage.src} alt={activeImage.title} /><div><span>{activeImage.meta}</span><h3>{activeImage.title}</h3><p>{activeImage.tag}</p></div></div></div>}
    </div>
  );
}
