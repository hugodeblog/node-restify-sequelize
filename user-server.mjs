import restify from 'restify';
import * as util from 'util';
import Joi from 'joi';

import {closeDB, createUser, updateUser, readUser, destroyUser,readAllUsers, passCheck} from './sequelize.mjs';

import DBG from 'debug';
const log = DBG('users:log');

// RESTサーバーセットアップ
var server = restify.createServer({
  name: "Rest-API-Test",
  version: "0.0.2"
});

server.use(restify.plugins.authorizationParser());
server.use(check);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({mapParams: true}));

server.listen(4000, "localhost", function() {
  log(server.name + ' listening at ' + server.url);
})

process.on('uncaughtException', function(err) {
  console.error('UNCAUGHT EXCEPTION: ' + (err.stack || err));
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('UNHANDLED PROMISE REJECTION: ' + util.inspect(p) + ' reason: ' + reason);
  process.exit(1);
});

function catchProcessDeath() {
  log('shutdown ...');
  process.exit(0);
}

process.on('SIGTERM', catchProcessDeath);
process.on('SIGINT', catchProcessDeath);
process.on('SIGHUP', catchProcessDeath);

process.on('exit', () => {
  closeDB();
  log('exiting...');
});

// Basic認証用のためのuser, password
const BasicAuthKey = {
   username: process.env.BASIC_AUTH_USER,
   password: process.env.BASIC_AUTH_PASS
 };

function check(req, res, next) {

  log('basic authorization check was called');
  if(req.authorization && req.authorization.basic) {
    if(req.authorization.basic.username === BasicAuthKey.username
      && req.authorization.basic.password === BasicAuthKey.password) {
      log('basic authorization OK');
      next();
    }
    else {
      res.contentType = 'json';
      res.send(401, 'Not authorized');
      next(false);
    }
  }
  else {
    res.contentType = 'json';
    res.send(500, 'No authorization key');
    next(false);
  }
}

// パラメータ用のスキーマ
const schema = Joi.object().keys({
  username: Joi.string().alphanum().min(6).max(16).required(),
  password: Joi.string().regex(/^[a-zA-Z_0-9]{8,30}$/).required()
})

// スキーマチェックエラータイプ
class SchemaError extends Error {
  constructor(...args) {
    super(...args)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SchemaError)
    }
    this.name = "Shema Check Error";
  }
}

// パラメータのスキーマチェック
function checkSchema(username, password) {
  log('checkSchema called');
  var {error, value} = schema.validate({"username":username, "password":password}, { abortEarly: false })
  if(error){
    log(error.details);
    throw new SchemaError("schema check failed");
  } else {
    log(value);
  }
}

// デバッグテスト用
function timeoutTest(value){
  return new Promise(function(resolve,reject){
    setTimeout(function(){
    console.log(`myFuncの実行中：引数${value}`);
    console.log(`${value}ms待ち完了`);
    console.log('=======');
    resolve('処理待ちしたよ');
    }, value);
  });
}

//　ユーザー作成
server.post('/users', async(req, res, next) => {

  // Timeoutをテストする場合
  // const result1 = await timeoutTest(7000);

  log('==> post /users called');
  log(`req.params.username = ${req.params.username}`);
  log(`req.params.password = ${req.params.password}`);
  log(`req.params.address = ${req.params.address}`);
  try {
    checkSchema(req.params.username, req.params.password);
    let result = await createUser(req.params.username, req.params.password, req.params.address);
    res.contentType = 'json';
    res.send(Object.assign(result, {'message': 'create user: ok'}));
  } catch(err) {
    res.send(500, err.message);
    next(false);
  }
});

// ユーザー参照
server.get('/users/:id', async(req, res, next) => {
  log('==> get /users/:id called');
  log(`req.params.id = ${req.params.id}`);
  try {
    let result = await readUser(req.params.id);
    res.contentType = 'json';
    res.send(Object.assign(result, {'message': 'find user: ok'}));
  } catch(err) {
    res.send(500, err.message);
    next(false);
  }
});

// ユーザー削除
server.del('/users/:id', async(req, res, next) => {
  log('==> del /users/:id called');
  log(`req.params.id = ${req.params.id}`);
  try {
    await destroyUser(req.params.id);
    res.contentType = 'json';
    res.send({'message': 'delete user: ok'});
  } catch(err) {
    res.send(500, err.message);
    next(false);
  }
});

// ユーザー一覧取得
server.get('/users', async(req, res, next) => {
  log('==> get /users called');
  try {
    let result = await readAllUsers();
    res.contentType = 'json';
    res.send(Object.assign(result, {'message': 'create user: ok'}));
  } catch(err) {
    res.send(500, err.message);
    next(false);
  }
});

// ユーザー情報更新
server.put('/users/:id', async(req, res, next) => {
  log('==> put /users/:id called');
  log(`req.params.id = ${req.params.id}`);
  log(`req.params.username = ${req.params.username}`);
  log(`req.params.password = ${req.params.password}`);
  log(`req.params.username = ${req.params.address}`);
  try {
    checkSchema(req.params.username, req.params.password);
    let result = await updateUser(req.params.id, req.params.username, req.params.password, req.params.address);
    res.contentType = 'json';
    res.send(Object.assign(result, {'message': 'update user: ok'}));
  } catch(err) {
    res.send(500, err.message);
    next(false);
  }
});

// ユーザー、パスワードチェック
server.post('/password-check', async(req, res, next) => {
  log('==> put /password-check called');
  log(`req.params.username = ${req.params.username}`);
  log(`req.params.password = ${req.params.password}`);
  try {
    const result = await passCheck(req.params.username, req.params.password);
    log(`${result}`);
    if(result) {
      res.contentType = 'json';
      res.send({'message': 'auth check: ok'});
    }
    else {
      res.send(401, 'auth check: incorrect');
      next(false);
    }
  } catch(err) {
    res.send(500, err.message);
    next(false);
  }
});
