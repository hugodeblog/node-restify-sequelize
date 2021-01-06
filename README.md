# Node.jsでRestify+Sequelizeでユーザー認証

主に以下のモジュールを用いて、ユーザー情報をSQLite3のDBに保存して、Restifyによるユーザー認証APIサーバーを構築するサンプル。

* Restifyユーザー認証サーバー
  * restify
  * sequelize
  * sqlite3
  * bcrypt
  * joi
* HTTPクライアント
  * superagent

## 実行手順

まずはRestifyで作ったユーザー認証サーバーを起動させておく。

```txt
$ BASIC_AUTH_USER=test BASIC_AUTH_PASS=password npm run start-server

> node-restify-sequelize@1.0.0 start-server
> DEBUG=db:*,users:* node ./user-server.mjs
```

その上でHTTPクライアントを起動させる。

```txt
$ BASIC_AUTH_USER=test BASIC_AUTH_PASS=password npm run start-client

> node-restify-sequelize@1.0.0 start-client
> node ./agent.mjs

------ read all users ------
[]
------ create user1 ------
{
  id: 1,
  username: 'sssmeme',
  address: 'Tokyo',
  message: 'create user: ok'
}
------ create user2 ------
{
  id: 2,
  username: 'ddbfafda',
  address: 'Tokyo',
  message: 'create user: ok'
}
------ read all users ------
[
  { id: 1, username: 'sssmeme', address: 'Tokyo' },
  { id: 2, username: 'ddbfafda', address: 'Tokyo' }
]
------ read user1 ------
{
  id: 1,
  username: 'sssmeme',
  address: 'Tokyo',
  message: 'find user: ok'
}
------ update user1 ------
{
  id: 1,
  username: 'sssmeme',
  address: 'Kagawa',
  message: 'update user: ok'
}
------ passcheck user1 ------
{ message: 'auth check: ok' }
------ delete user1 ------
{ message: 'delete user: ok' }
------ read user1 ------
stauts=>500, message=>Not found for id:1
```

最後はエラーで終わっているが、

```txt
stauts=>500, message=>Not found for id:1
```

これはユーザー１を削除した後に情報を見に行っているので、想定通りのエラー出力である。




