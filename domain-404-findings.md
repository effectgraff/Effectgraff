# Domain 404 findings — 2026-08-20

The public root `https://www.effectgraff.ru/` responds with HTTP 200 from nginx and exposes `x-amz-request-id`, confirming the Yandex Object Storage static-hosting path. The public route `https://www.effectgraff.ru/crm` responds with HTTP 404 from the same nginx/Yandex path before the React application loads.

The full-stack Manus deployment responds with HTTP 200 for both `https://effectport-5rhal3bg.manus.space/` and `https://effectport-5rhal3bg.manus.space/crm`; its headers include `x-powered-by: Express` and `x-manus-proxy-mode: transparent/1`.

Conclusion: the screenshot's 404 is not caused by the CRM React route or current Manus deployment. It is caused by the `.ru` domain still serving a static Yandex bucket, which has no SPA fallback and no full-stack `/api/trpc` backend. The malformed `/crm%60` URL adds a stray backtick but is not the root cause; even clean `/crm` returns 404 on the static bucket.

No DNS, MX, mail, certificate, or unrelated records were changed during this diagnosis.
