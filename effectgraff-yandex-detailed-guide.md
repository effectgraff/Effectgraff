# Подробный перенос EffectGraff в Yandex Cloud

## Текущие данные проекта

Используем доступное облако `cloud-effectgraff` и каталог `default`.

| Параметр | Значение |
|---|---|
| Cloud ID | `b1gr08i2ukmkedis7o8u` |
| Folder ID | `b1gm5t35jpji67oerk2r` |
| Bucket | `effectgraff.ru` |
| Bucket endpoint | `http://effectgraff.ru.website.yandexcloud.net` |
| Главная страница | `index.html` |
| Страница ошибки | `error.html` |
| Region для AWS CLI | `ru-central1` |
| S3 endpoint | `https://storage.yandexcloud.net` |

> Важно: `key_id` можно сообщить, но `secret` нельзя отправлять в чат. Secret сохраните локально; Yandex показывает его только один раз.

## 1. Войти в нужное облако

Откройте на компьютере Chrome или Edge и перейдите в [Yandex Cloud Console](https://console.yandex.cloud/). Войдите под аккаунтом, которому принадлежит `cloud-effectgraff`. В верхней панели выберите облако `cloud-effectgraff` и каталог `default`.

Проверить выбранное облако можно по адресу:

`https://console.yandex.cloud/folders/b1gm5t35jpji67oerk2r/dashboard`

Если появляется SmartCaptcha, пройдите её в том же браузере и не обновляйте страницу до завершения перехода.

## 2. Проверить платёжный аккаунт

Откройте dashboard и убедитесь, что отображается платёжный аккаунт `account-679`, баланс `0,00 ₽` и грант `4 000 ₽ / 4 000 ₽`. Bucket уже создан; его стоимость зависит от хранения, операций и трафика. Бесплатный грант ограничен условиями Yandex Cloud.

Откройте [Object Storage](https://console.yandex.cloud/folders/b1gm5t35jpji67oerk2r/storage/buckets) и откройте bucket `effectgraff.ru`.

## 3. Проверить static hosting

Откройте [настройки bucket](https://console.yandex.cloud/folders/b1gm5t35jpji67oerk2r/storage/buckets/effectgraff.ru/settings?tab=website).

В разделе **Веб-сайт** должны быть установлены следующие значения:

| Поле | Что ввести |
|---|---|
| Режим | **Хостинг** |
| Главная страница | `index.html` |
| Страница ошибки | `error.html` |

Нажмите **Сохранить**. Сейчас интерфейс уже показывает endpoint `http://effectgraff.ru.website.yandexcloud.net`.

## 4. Создать сервисный аккаунт

Откройте [IAM Yandex Cloud](https://console.yandex.cloud/link/iam). Если прямой адрес отправляет на CAPTCHA, пройдите проверку и повторно откройте ссылку.

В интерфейсе выберите каталог `default` с ID `b1gm5t35jpji67oerk2r`. Затем слева откройте **Identity and Access Management → Сервисные аккаунты** и нажмите **Создать сервисный аккаунт**.

Заполните форму:

| Поле | Значение |
|---|---|
| Имя | `effectgraff-uploader` |
| Описание | `Upload EffectGraff static website` |
| Роль каталога | `storage.editor` |

Нажмите **Создать**. Роль `storage.editor` нужна для загрузки и обновления объектов в Object Storage. Не используйте `admin` или `owner` для этого технического аккаунта.

## 5. Создать статический access key

Откройте созданный сервисный аккаунт `effectgraff-uploader`.

Нажмите **Создать новый ключ → Статический ключ доступа**.

В описании укажите:

`effectgraff.ru local upload`

Нажмите **Создать**. Yandex покажет два значения:

| Значение | Куда использовать |
|---|---|
| `key_id` | В AWS CLI как `AWS Access Key ID` |
| `secret` | В AWS CLI как `AWS Secret Access Key` |

Скопируйте оба значения в локальный менеджер паролей. **Не вставляйте `secret` в чат, GitHub, README, `.env` проекта или коммит.**

## 6. Подготовить проект на компьютере

Скачайте архив `effectgraff-repository.zip` и распакуйте его, например в:

`C:\Projects\effectgraff-portfolio` на Windows или `~/Projects/effectgraff-portfolio` на macOS/Linux.

Откройте терминал в корне проекта. В этой папке должны быть `package.json`, `client`, `vite.config.ts` и `pnpm-lock.yaml`.

Установите Node.js LTS с [официального сайта Node.js](https://nodejs.org/). Затем установите pnpm:

### Windows PowerShell

```powershell
corepack enable
corepack prepare pnpm@10.4.1 --activate
```

### macOS/Linux

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
```

Если Corepack выдаёт ошибку подписи, используйте:

```bash
npm install --global pnpm@10.4.1
```

## 7. Собрать сайт

В терминале, находясь в корне проекта, выполните:

```bash
pnpm install --frozen-lockfile
pnpm build
```

После успешной сборки должна существовать папка `dist/public/`, внутри которой будет `index.html`, папка `assets`, SEO-файлы и юридические страницы.

## 8. Установить AWS CLI

Для загрузки в Object Storage используйте AWS CLI, совместимый с S3 API.

Установка выполняется по [официальной инструкции AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). После установки проверьте:

```bash
aws --version
```

## 9. Настроить AWS CLI локально

Выполните:

```bash
aws configure --profile effectgraff
```

Терминал задаст четыре вопроса. Вводите так:

```text
AWS Access Key ID: <вставьте key_id>
AWS Secret Access Key: <вставьте secret локально>
Default region name: ru-central1
Default output format: json
```

Secret не отображается при вводе — это нормально. Он сохранится в локальном файле профиля AWS, а не в репозитории проекта.

## 10. Загрузить сайт в bucket

### Windows PowerShell

Из корня проекта выполните:

```powershell
aws --endpoint-url https://storage.yandexcloud.net `
  --profile effectgraff `
  s3 cp --recursive .\dist\public\ s3://effectgraff.ru/
```

### macOS/Linux

```bash
aws --endpoint-url https://storage.yandexcloud.net \\
  --profile effectgraff \\
  s3 cp --recursive ./dist/public/ s3://effectgraff.ru/
```

Команда загрузит `index.html` в корень bucket, а `assets`, `__manus__` и `.well-known` — как соответствующие папки.

## 11. Проверить загрузку

Сначала проверьте список объектов:

### Windows PowerShell и macOS/Linux

```bash
aws --endpoint-url https://storage.yandexcloud.net \\
  --profile effectgraff \\
  s3 ls s3://effectgraff.ru/ --recursive
```

В списке должны быть `index.html`, `assets/index-*.css`, `assets/index-*.js`, `robots.txt`, `sitemap.xml`, `privacy.html` и `terms.html`.

Затем откройте endpoint:

[Открыть временный адрес Yandex](http://effectgraff.ru.website.yandexcloud.net)

До загрузки объектов этот адрес будет показывать ошибку или пустой ответ; после загрузки должен открыться сайт.

## 12. Настроить домен effectgraff.ru

Регистрация домена и управление DNS выполняются у регистратора, где куплен `effectgraff.ru`. В DNS создайте записи, которые требует выбранный способ подключения домена в Yandex Cloud. Не вводите произвольные IP-адреса: скопируйте целевые значения из формы подключения домена/сертификата Yandex Cloud.

Для HTTPS откройте [Yandex Certificate Manager](https://console.yandex.cloud/folders/b1gm5t35jpji67oerk2r/certificate-manager/certificates) и создайте сертификат для:

- `effectgraff.ru`;
- `www.effectgraff.ru`, если нужен адрес с `www`.

Yandex Cloud покажет DNS-записи для проверки владения доменом. Эти записи нужно добавить у регистратора. После выпуска сертификата подключите домен к hosting endpoint согласно инструкции Yandex Cloud.

## 13. Обновить SEO после появления домена

После того как `https://effectgraff.ru` начнёт открываться, в проекте необходимо заменить Manus canonical/OG URLs и адреса в sitemap на `https://effectgraff.ru`, затем заново выполнить `pnpm build` и повторить S3-загрузку.

До этого не объявляйте `.ru` основной canonical-версией: иначе поисковики могут увидеть адрес, который ещё не работает.

## 14. Безопасность после публикации

После первой загрузки:

1. Проверьте, что bucket разрешает публичное чтение объектов, но не публичную запись.
2. Удалите локальный access key с компьютера, если он нужен только для разовой загрузки, либо храните его в менеджере паролей.
3. Не добавляйте `.aws/credentials`, `secret`, JSON-ключи и `.env` в Git.
4. При подозрении на утечку немедленно удалите access key в IAM и создайте новый.

## Источники

[1]: https://yandex.cloud/en/docs/iam/quickstart-sa "Yandex Cloud — Getting started with service accounts"
[2]: https://yandex.cloud/en/docs/iam/operations/authentication/manage-access-keys "Yandex Cloud — Managing static access keys"
[3]: https://yandex.cloud/en/docs/storage/tools/aws-cli "Yandex Object Storage — AWS CLI"
[4]: https://yandex.cloud/en/docs/storage/operations/objects/upload "Yandex Object Storage — Uploading an object"
[5]: https://console.yandex.cloud "Yandex Cloud Console"
