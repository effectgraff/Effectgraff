# EffectGraff — primary public audit notes

Date: 2026-08-18

## Public observations

- Public site: https://www.effectgraff.ru/
- HTTPS and www redirect work.
- The homepage has RU/EN switching, a brief form, email/phone links, VK link/share, cookie consent, analytics disclosure, privacy.html, and terms.html.
- The brief currently opens a prepared email in the visitor's mail client; the site states that brief contents are not stored in the site database.
- Privacy.html explicitly says the operator must add current operator identity, legal address, and status where required.
- Terms.html also leaves operator identity, status, address, and other mandatory details to be completed by the owner.
- robots.txt currently points to the old Manus sitemap: https://effectport-5rhal3bg.manus.space/sitemap.xml. This is incorrect for the permanent .ru domain and must be changed to https://www.effectgraff.ru/sitemap.xml or https://effectgraff.ru/sitemap.xml.
- Need verify sitemap.xml itself, security headers, CSP, cookie behavior, external requests, TLS, and whether all media/audio paths return 200.

## Legal-risk framing

This is a working compliance analysis, not formal legal advice. The owner must confirm their legal status (individual, self-employed, individual entrepreneur, or legal entity), actual operator identity, processing purposes, storage/hosting arrangement, and whether any advertising distribution is performed. The site currently contains placeholders/disclaimers instead of complete operator details, so it should not be described as fully compliant until those facts are completed.

## Additional verified findings

- `https://www.effectgraff.ru/robots.txt` returns 200 but its Sitemap points to `https://effectport-5rhal3bg.manus.space/sitemap.xml`.
- `https://www.effectgraff.ru/sitemap.xml` returns 200 but every `<loc>` still uses the old Manus domain. This is a significant canonical/indexation defect after the .ru migration.
- `https://www.effectgraff.ru/.well-known/security.txt` returns 404.
- The WAV loop and at least one WebP image return 200 from the new Yandex bucket.
- The tested Yandex response did not expose the previously configured `_headers` security headers: the response showed only HTTP/2 200 in the filtered output. Object Storage static hosting may not apply Netlify-style `_headers` files as HTTP response headers. Security must therefore be evaluated at the Yandex edge, not assumed from the copied file.

## Official sources consulted

- Roskomnadzor Personal Data Portal, electronic notifications: https://pd.rkn.gov.ru/operators-registry/notification/ . It states that from 1 September 2022 operators must notify Roskomnadzor about the beginning or conduct of personal-data processing, except the statutory exceptions, and provides the electronic notification forms.
- Yandex Webmaster indexing documentation: https://yandex.ru/support/webmaster/ru/recommendations/indexing . Search-engine submission and sitemap controls should be configured for the permanent domain; the extracted page was browser-version gated, so the official URL is retained for the report.
- Yandex Webmaster robots.txt documentation: https://yandex.ru/support/webmaster/ru/controlling-robot/robots-txt . The permanent-domain robots file should reference the permanent-domain sitemap.
- Yandex Webmaster SEO-text threat guidance: https://yandex.ru/support/webmaster/ru/threat/seo-text . Avoid hidden, robot-only, keyword-stuffed or manipulative SEO text.

## Immediate remediation candidates

1. Replace the old Manus URL in robots.txt with https://www.effectgraff.ru/sitemap.xml.
2. Replace all old Manus URLs in sitemap.xml with the permanent .ru URLs and preserve RU/EN pages.
3. Restore /.well-known/security.txt on the Yandex bucket if the hosting model permits it.
4. Confirm that privacy.html and terms.html include the owner's actual legal identity/status and contact address; the current pages explicitly leave these details incomplete.
5. Confirm operator status, processing purposes, storage locations, analytics provider, and whether the owner has submitted the Roskomnadzor operator notification before claiming full Russian compliance.
6. Avoid claiming automatic top-ranking; use only legitimate organic SEO, Yandex Webmaster, Google Search Console where available, VK content, accurate structured data, and technical monitoring.

## Notification procedure finding

The official Roskomnadzor portal states that, from 1 September 2022, operators must notify Roskomnadzor about the beginning or conduct of personal-data processing except statutory exceptions. The portal provides electronic notification forms and allows filing through the portal using ESIA authentication or a qualified electronic signature: https://pd.rkn.gov.ru/operators-registry/notification/ and https://pd.rkn.gov.ru/operators-registry/notification/form/ .

For this site, the brief form collects contact details and project information, while analytics is consent-gated. Therefore the owner should verify the operator-notification position before representing the website as fully compliant. A self-employed status alone does not remove the need for legal review. The site should not publish a home address until the owner has decided what address is legally appropriate and consulted counsel.

Relevant legal references identified for review:
- Article 22 of Federal Law No. 152-FZ: https://www.consultant.ru/document/cons_doc_LAW_61801/d996966e22e1320c9de1ab82d9f6be12c3d9d765/
- Article 18.1 of Federal Law No. 152-FZ: https://www.consultant.ru/document/cons_doc_LAW_61801/eeeebe22bf738fd65bb66b95cc278911ae2525ee/
- Official legal publication portal: http://pravo.gov.ru/proxy/ips/?docbody&nd=102108261
