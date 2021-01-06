import {default as request} from 'superagent';
import * as util from 'util';
import * as url from 'url';
const URL = url.URL;
import DBG from 'debug';
const log = DBG('agent:log');

const BasicAuthKey = {
  user: process.env.BASIC_AUTH_USER,
  pass: process.env.BASIC_AUTH_PASS
};

function requestURL(path) {
  const requrl = new URL('http://localhost:4000');
  requrl.pathname = path;
  return requrl.toString();
}

async function create(username, password, address) {
  try {
    var res = await request.post(requestURL('/users'))
    .timeout({response: 5*1000, deadline: 10*1000})
    .send({'username':username, 'password':password, 'address':address})
    .set('Content-Type', 'application/json')
    .auth(BasicAuthKey.user, BasicAuthKey.pass);
    return res.body;
  } catch(err) {
    if(err.response && err.response.status && err.response.body)
      throw new Error(`stauts=>${err.response.status}, message=>${err.response.body}`);
    else
      throw new Error(err);
  }
}

async function read(id) {
  try {
    var res = await request.get(requestURL(`/users/${id}`))
    .timeout({response: 5*1000, deadline: 10*1000})
    .send()
    .set('Content-Type', 'application/json')
    .auth(BasicAuthKey.user, BasicAuthKey.pass);
    return res.body;
  } catch(err) {
    if(err.response && err.response.status && err.response.body)
      throw new Error(`stauts=>${err.response.status}, message=>${err.response.body}`);
    else
      throw new Error(err);
  }
}

async function update(id, username, password, address) {
  try {
    var res = await request.put(requestURL(`/users/${id}`))
    .timeout({response: 5*1000, deadline: 10*1000})
    .send({'username':username, 'password':password, 'address':address})
    .set('Content-Type', 'application/json')
    .auth(BasicAuthKey.user, BasicAuthKey.pass);
    return res.body;
  } catch(err) {
    if(err.response && err.response.status && err.response.body)
      throw new Error(`stauts=>${err.response.status}, message=>${err.response.body}`);
    else
      throw new Error(err);
  }
}

async function destroy(id) {
  try {
    var res = await request.delete(requestURL(`/users/${id}`))
    .timeout({response: 5*1000, deadline: 10*1000})
    .send()
    .set('Content-Type', 'application/json')
    .auth(BasicAuthKey.user, BasicAuthKey.pass);
    return res.body;
  } catch(err) {
    if(err.response && err.response.status && err.response.body)
      throw new Error(`stauts=>${err.response.status}, message=>${err.response.body}`);
    else
      throw new Error(err);
  }
}

async function pass(username, password) {
  try {
    var res = await request.post(requestURL('/password-check'))
    .timeout({response: 5*1000, deadline: 10*1000})
    .send({'username':username, 'password':password})
    .set('Content-Type', 'application/json')
    .auth(BasicAuthKey.user, BasicAuthKey.pass);
    return res.body;
  } catch(err) {
    if(err.response && err.response.status && err.response.body)
      throw new Error(`stauts=>${err.response.status}, message=>${err.response.body}`);
    else
      throw new Error(err);
  }
}

async function readAll(id) {
  try {
    var res = await request.get(requestURL('/users'))
    .timeout({response: 5*1000, deadline: 10*1000})
    .send()
    .set('Content-Type', 'application/json')
    .auth(BasicAuthKey.user, BasicAuthKey.pass);
    return res.body;
  } catch(err) {
    if(err.response && err.response.status && err.response.body)
      throw new Error(`stauts=>${err.response.status}, message=>${err.response.body}`);
    else
      throw new Error(err);
  }
}

(async () => {

  try {

    console.log('------ read all users ------');
    var result = await readAll();
    console.log(result);

    console.log('------ create user1 ------');
    var result = await create('sssmeme', '123ffffdadfaf', 'Tokyo');
    console.log(result);
    let userID1 = result.id;

    console.log('------ create user2 ------');
    var result = await create('ddbfafda', 'ifdafdallll', 'Tokyo');
    //var result = await create('ddbfafda', 'i', 'Tokyo');
    console.log(result);

    console.log('------ read all users ------');
    var result = await readAll();
    console.log(result);

    console.log('------ read user1 ------');
    result = await read(userID1);
    console.log(result);

    console.log('------ update user1 ------');
    result = await update(userID1, 'sssmeme', '123ffffdadfaf', 'Kagawa');
    console.log(result);

    console.log('------ passcheck user1 ------');
    result = await pass('sssmeme', '123ffffdadfaf');
    console.log(result);

    //console.log('------ passcheck wrong user1 ------');
    //result = await pass('sssmeme', '333ffffdadfaf');
    //console.log(result);

    console.log('------ delete user1 ------');
    result = await destroy(userID1);
    console.log(result);

    console.log('------ read user1 ------');
    result = await read(userID1);
    console.log(result);

  } catch(err) {
    console.error(err.message);
  }

})();
