### .env

```bash
DATABASE*URL="postgresql://postgres:\_pass*@localhost:5432/_db_?schema=public"
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
SERVER_DOMAIN=localhost

JWT_SECRET=""

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
YANDEX_CLIENT_ID=""
YANDEX_CLIENT_SECRET=""
YOOKASSA_SHOP_ID=""
YOOKASSA_SECRET_KEY=""
```

### Compile and run the project

```bash
$ npm install
$ prisma db push
$ prisma generate
```
