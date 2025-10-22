.env
DATABASE*URL="postgresql://postgres:\_pass*@localhost:5432/_db_?schema=public"
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
SERVER_DOMAIN=localhost

```bash
$ npm install
$ prisma db push
$ prisma generate
```
