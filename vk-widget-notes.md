# VK widget integration notes

The user supplied the official group URL: https://vk.ru/effectgraff

Public HTML inspection resolved the canonical group URL to https://vk.ru/public212505805, so the VK community ID is 212505805.

The planned widget uses VK OpenAPI at https://vk.com/js/api/openapi.js?169 and `VK.Widgets.Group` with mode 4. The widget is gated behind the site's explicit analytics/external-services consent so it is not loaded after Reject.

## Verification

In the local preview, after selecting Accept in the cookie-consent banner, the VK widget loaded successfully. The page exposed the widget iframe content with 289 followers and real posts, including the pinned HIP-UP Street Festival post and other EffectGraff publications. Before consent, the widget correctly showed a fallback link to https://vk.ru/effectgraff.
