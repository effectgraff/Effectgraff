# Автоматический перенос EffectGraff на Yandex Object Storage

В проект добавлен workflow `.github/workflows/deploy-yandex.yml`. После push в ветку `main` он автоматически устанавливает зависимости, запускает TypeScript-проверку, собирает сайт и синхронизирует `dist/public/` с bucket Yandex Object Storage.

## Одноразовая настройка

1. Зарегистрируйте `effectgraff.ru` и создайте billing account в Yandex Cloud. Документация Yandex указывает, что для Object Storage требуются оплачиваемые ресурсы: хранение, операции, исходящий трафик и DNS.
2. Создайте публичный bucket с точным именем `effectgraff.ru`.
3. Включите static website hosting, укажите `index.html` как главную страницу и `error.html` как страницу ошибки. Загрузите `error.html` из папки `site/` подготовленного архива, если он нужен выбранной конфигурации.
4. Создайте сервисный аккаунт с минимальными правами только на этот bucket и выпустите access key. Никогда не добавляйте ключи в frontend, repository files или commit history.
5. В настройках GitHub repository добавьте Actions secrets:
   - `YC_ACCESS_KEY_ID`
   - `YC_SECRET_ACCESS_KEY`
   - `YC_BUCKET` = `effectgraff.ru`
   - `YC_ENDPOINT` = `https://storage.yandexcloud.net`
6. Настройте HTTPS-сертификат в Yandex Certificate Manager.
7. Настройте DNS домена по значениям, которые выдаст Yandex Cloud. Для собственного домена bucket должен совпадать с доменом; Yandex Cloud описывает ANAME и делегирование DNS в официальной инструкции.
8. Сделайте тестовый push в `main` или запустите workflow вручную. После успешного запуска проверьте сайт по `https://effectgraff.ru`.

## Безопасность

Workflow запускается для `main` и вручную. Для Pull Request он не публикует сайт. Ключи доступны только CI и не попадают в браузер. При подозрении на утечку немедленно отзовите ключ и создайте новый.

## SEO после первого запуска

До переключения основного домена не меняйте canonical и sitemap на `effectgraff.ru`. После проверки рабочего HTTPS-адреса нужно обновить canonical, hreflang, Open Graph URL, sitemap и robots.txt, а Manus-домен оставить резервным с корректным redirect/canonical-поведением.

## Источники

- Yandex Cloud static website: https://yandex.cloud/en/docs/tutorials/web/static/console
- GitHub Pages publishing sources: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
