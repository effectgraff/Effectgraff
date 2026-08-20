# EffectGraff: публикация на Yandex Cloud с компьютера

Эта инструкция предназначена для загрузки проекта EffectGraff в GitHub и автоматической публикации статического сайта в bucket `effectgraff.ru` через GitHub Actions. Команды не содержат секретных значений. **Access key и Secret key нельзя отправлять в чат, хранить в файлах проекта или добавлять в Git.**

## 1. Что уже известно

| Параметр | Значение |
| --- | --- |
| GitHub repository | `https://github.com/effectgraff/Effectgraff.git` |
| Yandex Cloud ID | `b1geaqm5mia5t48e17eu` |
| Yandex folder ID | `b1gt6aljugksnrjecl5s` |
| Bucket | `effectgraff.ru` |
| Yandex Object Storage endpoint | `https://storage.yandexcloud.net` |
| GitHub Actions secrets | `YC_ACCESS_KEY_ID`, `YC_SECRET_ACCESS_KEY`, `YC_BUCKET`, `YC_ENDPOINT` |

## 2. Подготовьте файлы проекта

Скачайте из этого чата файл `effectgraff-repository.zip` в папку `Downloads` на компьютере. Распакуйте его в отдельную папку. Внутри после распаковки должны находиться `package.json`, `pnpm-lock.yaml`, папка `client/`, файл `vite.config.ts` и папка `.github/workflows/`.

Установите Git и Node.js 22 LTS. Для сборки используется pnpm; отдельная установка pnpm не обязательна, потому что workflow включает Corepack.

## 3. Загрузите исходники в GitHub

### macOS или Linux

Откройте Terminal. Перейдите в папку, где распакован архив, и выполните команды по одной:

```bash
cd /путь/к/распакованной/папке

git clone https://github.com/effectgraff/Effectgraff.git github-effectgraff
cp -R ./. github-effectgraff/
cd github-effectgraff

# Проверка, что нужные файлы находятся в корне репозитория
ls package.json vite.config.ts client .github/workflows/deploy-yandex.yml

git add .
git commit -m "Add EffectGraff portfolio and Yandex deployment workflow"
git push origin main
```

Если команда `cp -R ./. github-effectgraff/` копирует папку `github-effectgraff` саму в себя, используйте безопасный вариант: распакуйте архив во временную папку и скопируйте содержимое отдельно:

```bash
rm -rf /tmp/effectgraff-source
unzip -o ~/Downloads/effectgraff-repository.zip -d /tmp/effectgraff-source
cd /tmp/effectgraff-source
git clone https://github.com/effectgraff/Effectgraff.git ~/Effectgraff-github
cp -R /tmp/effectgraff-source/. ~/Effectgraff-github/
cd ~/Effectgraff-github
git add .
git commit -m "Add EffectGraff portfolio and Yandex deployment workflow"
git push origin main
```

### Windows PowerShell

Установите [Git for Windows](https://git-scm.com/download/win), откройте PowerShell и выполните:

```powershell
cd $HOME\Downloads
Expand-Archive -Force .\effectgraff-repository.zip .\effectgraff-source

git clone https://github.com/effectgraff/Effectgraff.git "$HOME\EffectGraff-github"
Copy-Item -Recurse -Force "$HOME\Downloads\effectgraff-source\*" "$HOME\EffectGraff-github\"
cd "$HOME\EffectGraff-github"

Get-ChildItem .\package.json, .\vite.config.ts, .\client, .\.github\workflows\deploy-yandex.yml

git add .
git commit -m "Add EffectGraff portfolio and Yandex deployment workflow"
git push origin main
```

При первой команде `git push` GitHub может открыть окно авторизации. Войдите под владельцем репозитория `effectgraff`. Не вставляйте пароль в терминал, если GitHub предлагает браузерную авторизацию.

После push проверьте, что в репозитории появились `package.json`, `client/`, `vite.config.ts` и `.github/workflows/deploy-yandex.yml`.

## 4. Создайте сервисный аккаунт Yandex Cloud

Откройте [Yandex Cloud Console](https://console.yandex.cloud/), выберите cloud `b1geaqm5mia5t48e17eu` и folder `b1gt6aljugksnrjecl5s`.

Перейдите в **IAM и сервисы → Сервисные аккаунты → Создать сервисный аккаунт**. Назовите его `effectgraff-deployer`.

Назначьте ему минимальные права для загрузки объектов в bucket. Если консоль предлагает назначить роль на folder, используйте `storage.editor` для этого сервисного аккаунта. Более строгий вариант — назначить права на конкретный bucket, если интерфейс позволяет выбрать bucket-level access.

Откройте созданный сервисный аккаунт, выберите **Создать статический ключ доступа** и сохраните оба значения в защищённом месте:

```text
Access key ID      → это значение станет YC_ACCESS_KEY_ID
Secret access key  → это значение станет YC_SECRET_ACCESS_KEY
```

Secret access key показывается один раз. Не добавляйте его в проект, README, скриншоты, историю Git или сообщения чата.

## 5. Добавьте GitHub Actions secrets

В GitHub откройте репозиторий `effectgraff/Effectgraff` → **Settings → Secrets and variables → Actions → New repository secret**.

Создайте четыре secrets. В поле **Name** укажите имя точно, а в **Secret** вставьте соответствующее значение:

| Name | Secret value |
| --- | --- |
| `YC_ACCESS_KEY_ID` | Access key ID сервисного аккаунта |
| `YC_SECRET_ACCESS_KEY` | Secret access key сервисного аккаунта |
| `YC_BUCKET` | `effectgraff.ru` |
| `YC_ENDPOINT` | `https://storage.yandexcloud.net` |

Секреты после сохранения не отображаются. Это нормально. Не используйте обычные repository variables для ключей.

## 6. Проверьте bucket

В Yandex Cloud Object Storage откройте bucket `effectgraff.ru` и проверьте:

| Настройка | Значение |
| --- | --- |
| Публичное чтение объектов | Включено |
| Публичная запись | Выключена |
| Static website hosting | Включён |
| Главная страница | `index.html` |
| Страница ошибки | `index.html` |

Использование `index.html` как error page удобно для React SPA: неизвестные маршруты возвращают приложение, а не пустую страницу. Для bucket с публичным чтением не включайте публичную запись.

## 7. Запустите деплой

В репозитории откройте **Actions → Build and deploy EffectGraff to Yandex Object Storage**. Нажмите **Run workflow**, выберите ветку `main` и подтвердите запуск.

Workflow автоматически:

1. скачает исходники;
2. установит зависимости через pnpm;
3. выполнит TypeScript-проверку;
4. соберёт сайт;
5. установит AWS CLI;
6. синхронизирует `dist/public/` с `s3://effectgraff.ru/` через Yandex S3 endpoint.

Успешный запуск должен завершиться зелёной отметкой. Если workflow не появился, значит файл `.github/workflows/deploy-yandex.yml` ещё не попал в ветку `main`.

## 8. Ошибки и безопасное исправление

Если появляется `AccessDenied`, проверьте роль сервисного аккаунта, правильность `YC_ACCESS_KEY_ID`, `YC_SECRET_ACCESS_KEY`, имя bucket и endpoint. Не публикуйте лог с секретами; GitHub обычно маскирует secrets, но всё равно удалите подозрительный ключ в Yandex Cloud и создайте новый.

Если появляется `NoSuchBucket`, проверьте точное имя `effectgraff.ru` и что bucket находится в том же аккаунте Yandex Cloud. Если появляется ошибка `pnpm install`, проверьте, что в репозитории присутствует `pnpm-lock.yaml` и загружена вся структура проекта.

## 9. Домен и HTTPS

После первого успешного upload настройте DNS `effectgraff.ru` по значениям, которые выдаст Yandex Cloud для Object Storage или CDN. Для постоянного HTTPS настройте сертификат в Yandex Certificate Manager и подключите его через рекомендованный Yandex Cloud CDN/hosting flow. До проверки рабочего HTTPS не меняйте canonical и sitemap сайта на `effectgraff.ru`.

## Источники

[1]: https://yandex.cloud/en/docs/tutorials/web/static/ "Yandex Cloud: Static website in Object Storage"
[2]: https://yandex.cloud/en/docs/storage/operations/hosting/setup "Yandex Cloud: Setting up hosting in Object Storage"
[3]: https://yandex.cloud/en/docs/iam/operations/authentication/manage-access-keys "Yandex Cloud: Managing static access keys"
[4]: https://docs.github.com/actions/security-guides/using-secrets-in-github-actions "GitHub Docs: Using secrets in GitHub Actions"
[5]: https://docs.github.com/actions "GitHub Actions documentation"
