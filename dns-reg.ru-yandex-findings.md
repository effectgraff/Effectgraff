# DNS findings for effectgraff.ru

- Yandex Object Storage custom-domain bucket name must exactly match the domain: `effectgraff.ru`.
- The bucket is already configured for static hosting with `index.html` and `error.html`.
- Yandex custom-domain docs show an apex-domain ANAME example pointing `effectgraff.ru.` to `effectgraff.ru.website.yandexcloud.net`; CNAME is recommended only for a third-level name such as `www.effectgraff.ru`.
- Yandex Certificate Manager can issue a managed Let's Encrypt certificate. Domain verification records are generated per certificate and must be copied exactly; they may be DNS_CNAME or DNS_TXT depending on the selected challenge.
- After the certificate is issued, Object Storage bucket settings → Security → HTTPS → Configure → Certificate Manager is used to attach it. Yandex docs state HTTPS becomes available within about 30 minutes after certificate configuration, and HTTP-to-HTTPS redirect is enabled automatically.
- REG.RU DNS zone editor supports A, CNAME, TXT, MX and related records. CNAME cannot coexist with another record for the same hostname. DNS changes may take up to 24 hours.

Sources:
- https://yandex.cloud/en/docs/storage/operations/hosting/own-domain
- https://yandex.cloud/en/docs/storage/operations/hosting/certificate
- https://yandex.cloud/en/docs/certificate-manager/operations/managed/cert-validate
- https://help.reg.ru/support/dns-servery-i-nastroyka-zony/nastroyka-resursnykh-zapisey-dns/chto-takoye-resursnyye-zapisi-dns
- https://help.reg.ru/support/dns-servery-i-nastroyka-zony/nastroyka-resursnykh-zapisey-dns/nastroyka-resursnykh-zapisey-v-lichnom-kabinete
