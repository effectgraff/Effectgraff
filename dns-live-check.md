# Live DNS check — effectgraff.ru

Checked 2026-08-17.

- `_acme-challenge.effectgraff.ru CNAME` resolves publicly to `fpqh3h8itpq0jvqngee7.cm.yandexcloud.net.`. This validation CNAME is correct.
- `_acme-challenge.effectgraff.ru TXT` has no TXT answer; this is expected because the selected method is CNAME.
- `effectgraff.ru A` still resolves to `31.31.196.172` (REG.RU/old hosting).
- `www.effectgraff.ru A` still resolves to `31.31.196.172`.
- `www.effectgraff.ru CNAME` is not configured.
- `effectgraff.ru` has no CNAME answer at the apex.
- `http://effectgraff.ru.website.yandexcloud.net/` responds `404 Not Found`, meaning the endpoint is reachable but the bucket does not currently serve a root index object, or the upload is not complete.

Conclusion: certificate DNS challenge record is publicly visible; domain routing still points to old hosting; site files are not verified in the Yandex bucket; certificate status and HTTPS attachment require checking the Yandex console after validation completes.
