import Sequelize from 'sequelize';
import { default as jsyaml } from 'js-yaml';
import * as util from 'util';
import { promises as fs } from 'fs';
import { default as bcrypt } from 'bcrypt';
const saltRounds = 10;

import DBG from 'debug';
const log = DBG('db:log');

//ハッシュを返す
async function hashpass(password) {
    let salt = await bcrypt.genSalt(saltRounds);
    let hashed = await bcrypt.hash(password, salt);
    return hashed;
}

//パスワードハッシュの比較
async function verifypass(passA, passB) {
  let pwcheck = await bcrypt.compare(passA, passB);
  return pwcheck;
}


class User extends Sequelize.Model {
  // パスワード抜きのユーザーデータにする
  getSanitized() {
    return {"id": this.id, "username": this.username, "address": this.address}
  }
}

let sequlz;

export async function connectDB() {

  if(sequlz) return sequlz;

  const yamltext = await fs.readFile('sequelize-sqlite.yaml', 'utf8');
  const params = await jsyaml.safeLoad(yamltext, 'utf8');

  sequlz = new Sequelize(
    params.dbname,
    params.uesrname,
    params.password,
    params.params
  );

  User.init({
    username: {type: Sequelize.STRING, unique: true},
    password: Sequelize.STRING,
    address: Sequelize.STRING
  }, {
    sequelize: sequlz,
    modelName: 'User',
    timestamps: true
  });

  await User.sync({ force: true });
}


export async function closeDB() {

  if (sequlz) sequlz.close();
  sequlz = undefined;

}

export async function createUser(user, pass, address) {
   await connectDB();
   const hashedPass = await hashpass(pass);

   // 同じユーザーがいるかどうかチェックする
   var result = await User.findOne( {where:{username:user} });
   if(!result) {
     // ok
   } else {
     throw new Error(`Same username not allowed for ${user}`);
   }

   result = await User.create( {
     username:user, password:hashedPass, address:address
   });
   return result.getSanitized();
}

export async function readUser(user_id) {
  await connectDB();
  var result = await User.findOne( {where:{id:user_id} });
  if(!result) {
    throw new Error(`Not found for id:${user_id}`);
  } else {
    return result.getSanitized();
  }
}

export async function updateUser(user_id, user, pass, address) {
  await connectDB();
  const hashedPass = await hashpass(pass);
  var result = await User.findOne( {where:{id:user_id} });
  if(!result) {
    throw new Error(`Not found for id:${user_id}`);
  } else {
    await User.update(
      {username:user, password:hashedPass, address:address},
      {where:{id:user_id}}
    );
    result = await User.findOne( {where:{id:user_id} });
    return result.getSanitized();
  }
}

export async function destroyUser(user_id) {
  await connectDB();
  var result = await User.findOne( {where:{id:user_id} });
  if(!result) {
    throw new Error(`Not found for id:${user_id}`);
  } else {
    await User.destroy( {where:{id:user_id} });
  }
}

export async function readAllUsers() {
  await connectDB();
  const results = await User.findAll({});
  if(!results) {
    throw new Error('Read all user failed');
  } else {
    return results.map(result => result.getSanitized());
  }
}

export async function passCheck(user, pass) {
   await connectDB();
   var result = await User.findOne( {where:{username:user} });
   if(!result) {
     throw new Error(`Not found for ${user}`);
   } else {
     let passOK = await verifypass(pass, result.password);
     log(`passcheck => ${pass}:${result.password}:${passOK}`);
     return passOK;
   }
}
