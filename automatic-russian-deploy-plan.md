# Автоматический перенос EffectGraff на российский hosting

## Рекомендуемая схема

1. Репозиторий хранит исходный код сайта.
2. При push в ветку `main` CI запускает `pnpm install --frozen-lockfile` и `pnpm build`.
3. CI публикует содержимое `dist/public/` в публичный bucket Yandex Object Storage через S3 API.
4. Bucket называется точно `effectgraff.ru`; для собственного домена Yandex Cloud требует совпадение имени bucket и домена.
5. DNS домена указывает на hosting, HTTPS настраивается сертификатом, а старый Manus-домен остаётся резервным.

## Секреты CI

Секреты должны храниться только в защищённом хранилище CI: `YC_ACCESS_KEY_ID`, `YC_SECRET_ACCESS_KEY`, `YC_BUCKET=effectgraff.ru`, `YC_ENDPOINT=https://storage.yandexcloud.net`. Их нельзя записывать в репозиторий, frontend или публичные файлы.

## Триггер

Публикация запускается только после push в `main`. Pull request должен запускать только сборку и проверку, без публикации. Ручной запуск deploy полезен для аварийного восстановления.

## Перед запуском

Нужно зарегистрировать домен, создать billing account и bucket в Yandex Cloud, включить статический website hosting, создать сервисный аккаунт с минимальными правами на конкретный bucket, настроить HTTPS и DNS. По официальной документации Yandex Cloud статический hosting Object Storage использует публичный bucket, поддерживает собственный домен и загрузку файлов через S3 API.

## Важное ограничение

Yandex Cloud documentation указывает, что для этого сценария требуются оплачиваемые ресурсы: хранение, операции, исходящий трафик и DNS-запросы. Поэтому автоматический перенос может быть технически автоматическим, но не гарантированно бесплатным.

## Альтернатива без российского hosting

GitHub Pages можно автоматически обновлять через GitHub Actions после push, но это не российская инфраструктура и не гарантирует доступность без VPN у всех провайдеров РФ. SourceCraft поддерживает CI/CD, secrets и service connections, но для конечного hosting всё равно нужно выбрать поддерживаемое хранилище или площадку.

## References

- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- SourceCraft CI/CD: https://sourcecraft.dev/portal/docs/en/sourcecraft/concepts/ci-cd
- Yandex static hosting: https://yandex.cloud/en/docs/tutorials/web/static/console
