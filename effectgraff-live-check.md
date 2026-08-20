
Live check 2026-08-19:
- https://effectgraff.ru returns 301 to http://www.effectgraff.ru then 301 to https://www.effectgraff.ru; this is functional but should be tightened to avoid the intermediate HTTP redirect.
- https://www.effectgraff.ru returns HTTP/2 200 with index.html.
- robots.txt and sitemap.xml return HTTP/2 200.
- /.well-known/security.txt currently returns HTTP/2 404 on the Yandex copy.
- Public page renders title, hero, portfolio, archive tabs, VK card, contact links and brief form.
- Browser exposes the music-loop button, cookie consent banner, portfolio items, CTA and brief inputs/select/textarea.
- Public page references media under /manus-storage/; visual capture showed hero and portfolio images loading in the browser.
- The audio button was clicked in browser; no audible confirmation can be established from text extraction alone and should be checked with browser console or user device.
