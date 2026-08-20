# EffectGraff SEO audit notes

## Public-site findings

Audit date: 2026-08-16.

The public page at `https://effectport-5rhal3bg.manus.space/` exposes a Russian-language H1, a clear description of six artists from Saint Petersburg, Nizhnevartovsk, Krasnoyarsk, and Vladivostok, a visible archive, contact links, and an Organization JSON-LD block in source.

Critical technical issue: the public `robots.txt` currently declares `Sitemap: https://effectgraff-portfolio.manus.space/sitemap.xml`, while the public site being checked is `https://effectport-5rhal3bg.manus.space/`. The public sitemap also contains `https://effectgraff-portfolio.manus.space/`. The source `index.html` has the same stale canonical, Open Graph URL, JSON-LD URL, and title URL. These should be changed to the currently published domain before requesting indexing.

The current page has one principal H1 and a visible content-rich archive. The `meta keywords` tag is present but should not be treated as a ranking lever for Google. The archive includes descriptive titles for selected works and generic page labels for the remaining PDF pages. The contact section contains a clear commercial-project and open-call intent, email, phone, and Instagram links.

## Official guidance captured

1. Google documents that `meta description` may be used for snippets, but snippets are primarily generated from visible page content; descriptions should be short, relevant, and descriptive rather than keyword strings: https://developers.google.com/search/docs/appearance/snippet
2. Google recommends descriptive, concise, non-stuffed title elements, a clear main visual title, and matching the language/script of the page: https://developers.google.com/search/docs/appearance/title-link
3. Google lists supported tags and notes that `meta keywords` has no effect on indexing/ranking; viewport and description are supported, and valid HTML matters: https://developers.google.com/search/docs/crawling-indexing/special-tags
4. Yandex Webmaster recommends adding a sitemap and treats title and description as inputs for search presentation: https://yandex.ru/support/webmaster/ru/diagnosis/recommendations

## Immediate technical priorities

1. Replace stale `effectgraff-portfolio.manus.space` references with `effectport-5rhal3bg.manus.space` in canonical, Open Graph, JSON-LD, robots.txt, and sitemap.xml.
2. Make the title and description reflect the strongest commercial-intent queries without stuffing.
3. Add visible, human-readable phrases for commercial mural commissions, graffiti wall painting, street-art projects, festival applications, and open calls.
4. Add an explicit `WebSite`/`Organization` identity only when it matches the live URL and real contact data.
5. Submit the live sitemap manually in Google Search Console and Yandex Webmaster; indexing and ranking cannot be guaranteed by metadata alone.
