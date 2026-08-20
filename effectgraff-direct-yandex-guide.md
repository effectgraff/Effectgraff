# EffectGraff → effectgraff.ru: перенос с компьютера напрямую в Yandex Cloud

Эта инструкция полностью обходит GitHub. Вы скачиваете архив проекта на компьютер, собираете сайт локально и загружаете готовые статические файлы прямо в bucket Yandex Object Storage.

> **Безопасность:** не отправляйте в чат Access key, Secret key, OAuth-токен или пароль. Ключи вводятся только в локальный терминал компьютера или в защищённой консоли Yandex Cloud.

## 1. Данные проекта

| Параметр | Значение |
| --- | --- |
| Домен и bucket | `effectgraff.ru` |
| Cloud ID | `b1geaqm5mia5t48e17eu` |
| Folder ID | `b1gt6aljugksnrjecl5s` |
| S3 endpoint | `https://storage.yandexcloud.net` |
| Локальная папка проекта | любая, например `EffectGraff` |
| Главный файл сайта | `index.html` |
| React SPA error page | `index.html` |

## 2. Скачайте и распакуйте файлы

Скачайте вложенный файл `effectgraff-repository.zip` из этого чата на компьютер. Распакуйте его в папку без пробелов в имени, например:

- Windows: `C:\Users\ВАШ_ПОЛЬЗОВАТЕЛЬ\EffectGraff`
- macOS: `/Users/ВАШ_ПОЛЬЗОВАТЕЛЬ/EffectGraff`
- Linux: `/home/ВАШ_ПОЛЬЗОВАТЕЛЬ/EffectGraff`

В корне папки должны находиться:

```text
package.json
pnpm-lock.yaml
vite.config.ts
tsconfig.json
client/
server/
shared/
.github/workflows/deploy-yandex.yml   # нужен только для будущего GitHub-деплоя
```

Для прямой публикации на Yandex используются исходники и `package.json`; папку `.github` можно оставить, но GitHub для этого маршрута не требуется.

## 3. Установите программы

Установите следующие программы с официальных страниц:

| Программа | Для чего нужна |
| --- | --- |
| Node.js 22 LTS | сборка React-сайта |
| Git | не обязателен для прямой загрузки, но полезен для резервной копии |
| Yandex Cloud CLI | вход и управление bucket |
| AWS CLI | загрузка файлов через S3-совместимый endpoint Yandex Object Storage |

После установки откройте новое окно терминала и проверьте:

```bash
node --version
yc --version
aws --version
```

Если команда `yc` не найдена, установите Yandex Cloud CLI по официальной инструкции и повторите проверку. Если команда `aws` не найдена, установите AWS CLI по официальной инструкции для вашей ОС.

## 4. Авторизуйте Yandex Cloud CLI

Откройте Terminal на macOS/Linux или PowerShell на Windows и выполните:

```bash
yc init
```

CLI откроет браузер. Войдите в Yandex Cloud под владельцем облака и подтвердите доступ. После завершения установите нужные cloud и folder:

```bash
yc config set cloud-id b1geaqm5mia5t48e17eu
yc config set folder-id b1gt6aljugksnrjecl5s
yc config list
```

В выводе должны быть указаны cloud ID `b1geaqm5mia5t48e17eu` и folder ID `b1gt6aljugksnrjecl5s`.

## 5. Bucket и статический хостинг

Bucket `effectgraff.ru` уже должен быть создан в выбранном folder. Если его ещё нет, выполните:

```bash
yc storage bucket create effectgraff.ru --public-read --public-list --folder-id b1gt6aljugksnrjecl5s
```

Публичное чтение и публичный список нужны для статического сайта. Публичную запись не включайте.

Создайте файл настроек сайта.

### macOS/Linux

В терминале в папке проекта выполните:

```bash
cd /путь/к/EffectGraff
cat > website-settings.json <<'EOF'
{
  "index": "index.html",
  "error": "index.html"
}
EOF
```

### Windows PowerShell

Откройте PowerShell в папке проекта и выполните:

```powershell
cd C:\путь\к\EffectGraff
@'
{
  "index": "index.html",
  "error": "index.html"
}
'@ | Set-Content -Encoding utf8 .\website-settings.json
```

Примените настройки:

```bash
yc storage bucket update --name effectgraff.ru --website-settings-from-file website-settings.json
```

В консоли Yandex Cloud также проверьте **Object Storage → effectgraff.ru → Settings → General**:

| Настройка | Значение |
| --- | --- |
| Read objects | For all / публичное чтение |
| Read object list | For all / публичный список |
| Write objects | не публично |
| Website hosting | включён |
| Home page | `index.html` |
| Error page | `index.html` |

## 6. Создайте сервисный аккаунт для загрузки

В Yandex Cloud Console откройте **IAM и сервисы → Сервисные аккаунты → Создать сервисный аккаунт**.

Название:

```text
effectgraff-uploader
```

Назначьте ему минимальную роль, позволяющую загружать и удалять объекты bucket. Если в вашей консоли доступна роль на уровне конкретного bucket, назначьте права только на `effectgraff.ru`. Если доступна только folder-level роль, используйте `storage.editor` для выбранного folder.

Создайте статический ключ доступа:

```bash
yc iam access-key create --service-account-name effectgraff-uploader --description "EffectGraff direct deployment"
```

Сохраните значения, которые покажет команда:

```text
access_key.id       → Access Key ID
secret              → Secret Access Key
```

Secret Access Key показывается только при создании. Не сохраняйте его в файле проекта и не добавляйте в Git.

## 7. Настройте локальный профиль AWS CLI

Yandex Object Storage совместим с S3 API, поэтому загрузка выполняется через AWS CLI.

Запустите:

```bash
aws configure --profile effectgraff
```

Введите ответы:

```text
AWS Access Key ID:       <вставьте Access Key ID из шага 6>
AWS Secret Access Key:   <вставьте Secret Access Key из шага 6>
Default region name:     ru-central1
Default output format:   json
```

Эти данные сохраняются локально в профиле AWS CLI. Никогда не вводите их в исходный код, `package.json`, `.env`, README или чат.

## 8. Соберите сайт локально

В терминале перейдите в корень проекта:

```bash
cd /путь/к/EffectGraff
```

Установите зависимости:

```bash
corepack enable
pnpm install --frozen-lockfile
```

Проверьте TypeScript:

```bash
pnpm check
```

Если проверка завершилась без ошибок, соберите сайт:

```bash
pnpm build
```

После успешной сборки должна существовать папка:

```text
dist/public/
```

Проверьте наличие главного файла:

```bash
ls dist/public/index.html
```

В Windows PowerShell используйте:

```powershell
Get-ChildItem .\dist\public\index.html
```

## 9. Загрузите готовый сайт в Yandex Object Storage

### macOS/Linux

Выполните:

```bash
AWS_EC2_METADATA_DISABLED=true aws s3 sync dist/public/ s3://effectgraff.ru/ --endpoint-url https://storage.yandexcloud.net --region ru-central1 --profile effectgraff --delete
```

### Windows PowerShell

Выполните:

```powershell
$env:AWS_EC2_METADATA_DISABLED = "true"
aws s3 sync .\dist\public\ s3://effectgraff.ru/ --endpoint-url https://storage.yandexcloud.net --region ru-central1 --profile effectgraff --delete
```

Флаг `--delete` удаляет из bucket старые файлы, которых больше нет в новой сборке. Это нужно для чистого деплоя, но перед командой убедитесь, что `dist/public/` содержит актуальную сборку.

## 10. Проверьте сайт до подключения домена

После загрузки откройте в Yandex Console карточку bucket `effectgraff.ru` и найдите поле **Link** на вкладке Website. Откройте эту ссылку в браузере.

Проверьте:

- загружается главная страница;
- отображаются изображения и логотип;
- работает переключение RU/EN;
- открывается контактная форма;
- корректно работает музыка после ручного нажатия Play;
- при обновлении страницы не появляется ошибка 404;
- в мобильном браузере нет горизонтального скролла.

Если главная страница не загружается, проверьте, что объект находится именно по ключу `index.html`, а не `dist/public/index.html`.

## 11. Подключите `effectgraff.ru` и HTTPS

Для собственного домена bucket должен иметь имя `effectgraff.ru`. В настройках DNS регистратора укажите записи, которые выдаёт Yandex Cloud для Object Storage или CDN. Не придумывайте IP-адреса вручную: значения зависят от выбранного способа публикации.

Для HTTPS откройте **Certificate Manager**, выпустите сертификат на:

```text
effectgraff.ru
www.effectgraff.ru
```

Для выпуска сертификата потребуется DNS-подтверждение. Добавьте выданную Yandex TXT-запись у регистратора домена, дождитесь проверки и подключите сертификат к рекомендованному Yandex Cloud CDN/hosting flow.

По официальной документации, базовое статическое hosting в Object Storage по умолчанию доступно по HTTP; HTTPS требует сертификат Yandex Certificate Manager. Поэтому не заявляйте, что HTTPS уже работает, пока сертификат и DNS не проверены в браузере.

## 12. Финальная проверка DNS

На macOS/Linux выполните:

```bash
dig +short effectgraff.ru
curl -I https://effectgraff.ru
```

В Windows PowerShell выполните:

```powershell
Resolve-DnsName effectgraff.ru
curl.exe -I https://effectgraff.ru
```

Ожидаемый результат для HTTPS — ответ `200` или корректный redirect `301/308` на HTTPS. Если появляется `NXDOMAIN`, DNS ещё не распространился или запись указана неверно. Если появляется сертификатная ошибка, дождитесь выпуска сертификата и проверьте привязку домена.

## 13. Повторное обновление сайта

После изменения исходников повторяйте только этот короткий цикл:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm build
AWS_EC2_METADATA_DISABLED=true aws s3 sync dist/public/ s3://effectgraff.ru/ --endpoint-url https://storage.yandexcloud.net --region ru-central1 --profile effectgraff --delete
```

В Windows PowerShell последняя команда будет такой:

```powershell
$env:AWS_EC2_METADATA_DISABLED = "true"
aws s3 sync .\dist\public\ s3://effectgraff.ru/ --endpoint-url https://storage.yandexcloud.net --region ru-central1 --profile effectgraff --delete
```

## 14. Что не нужно делать

Не загружайте в bucket папку `client/` вместо собранного `dist/public/`. Не публикуйте Secret Access Key. Не включайте публичную запись bucket. Не меняйте canonical, sitemap и Open Graph URL на `effectgraff.ru` до фактической проверки рабочего HTTPS. Не удаляйте Manus-домен, пока новый домен не работает стабильно.

## Источники

[1]: https://yandex.cloud/en/docs/storage/operations/hosting/setup "Yandex Cloud: Setting up static website hosting"
[2]: https://yandex.cloud/en/docs/cli/cli-ref/storage/cli-ref/bucket/create "Yandex Cloud CLI: creating a bucket"
[3]: https://yandex.cloud/en/docs/cli/cli-ref/iam/cli-ref/access-key/create "Yandex Cloud CLI: creating an access key"
[4]: https://yandex.cloud/en/docs/tutorials/web/static/ "Yandex Cloud: static website in Object Storage"
[5]: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html "AWS CLI installation documentation"
