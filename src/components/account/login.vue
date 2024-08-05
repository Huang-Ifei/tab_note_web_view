<script setup lang="ts">

import Icon_to_home from "../weight/icon_to_home.vue";
import axios from "axios";
import {ref} from "vue";
import * as Cookies from "js-cookie";
import router from "../../router";
import {getAddress} from "../../operation/address.ts";
import {JSEncrypt} from "jsencrypt";
import {privateKey, publicKey} from "../../operation/cryptic.ts";

const id = ref("")
const password = ref("")

const waitText = ref("")
const isRemember = ref(true)
async function login(){
  const setId = id.value
  let setPassword = password.value

  waitText.value = "正在处理登录请求"
  const url = getAddress()+"/account"
  //获取动态加密公钥
  const tokenCrypt = new JSEncrypt();
  const axiosResponse = await axios.get(getAddress() + "/public_key")
  tokenCrypt.setPublicKey(axiosResponse.data.toString())
  setPassword = tokenCrypt.encrypt(setPassword).toString()
  const response = await axios.post(url,{mesType: 1, id:setId, password:setPassword});
  if (response.data.response=='success') {
    waitText.value = "登录成功"

    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey)
    const decryptToken = decrypt.decrypt(response.data.token).toString();

    const crypt = new JSEncrypt();
    crypt.setPublicKey(publicKey)
    const encryptToken = crypt.encrypt(decryptToken).toString()

    sessionStorage.setItem('id', setId);
    sessionStorage.setItem('name', response.data.name);
    sessionStorage.setItem('encryptionToken', encryptToken);
    if (isRemember.value==true){
      Cookies.default.set('id',  setId.toString(),{ expires: 1024 });
      Cookies.default.set('name', response.data.name,{ expires: 1024 });
      Cookies.default.set('encryptionToken', encryptToken,{ expires: 1024 });
    }
    await router.push("/")
    window.location.reload()
  }else{
    waitText.value = response.data.response
  }
}
</script>

<template>
  <div id="title">
    <icon_to_home/>
  </div>
  <div id="login_view">
    <div id="login_content">
        <h2>登录您的TabNote账户_</h2>
        <a id="signup" href="/signup">没有账户？点此注册</a><br>
        账号<br>
        <input type="text" id="id" v-model="id"><br>
        密码<br>
        <input type="password" id="password" v-model="password"><br>
        <div style="color: #1a1a1a;font-size: 14px;width: 100%;margin-top:5px;margin-bottom:5px;display: flex;justify-content: center">
          <input type="checkbox" id="is_remember" style="margin: 2px;width: 15px;height: 15px" v-model="isRemember">记住我的登录状态
        </div>
        <button @click="login">
          验证->
        </button>
        <a style="color: #1a1a1a;font-size: 14px;width: 100%;display: flex;justify-content: center"> {{waitText}}</a>
    </div>
  </div>
</template>

<style scoped>
#login_view{
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 30px;
  height: calc(100% - 96px);
  justify-content: center;
  align-items: center;
}
#login_content{
  width: 350px;
  background: rgba(242, 242, 242, 0.85);
  padding: 20px;
  border-radius: 10px;
}
h2{
  margin-bottom: 0;
}
input{
  width: calc(100% - 22px);
}
#signup{
  cursor: pointer;
  color: #535bf2;
  position: relative;
  top: -5px;
  font-size: 14px;
}
button{
  margin-bottom: 10px;
  background: #000000;
  color: #ffffff;
  width: 100%;
  height: 42px;
  padding: 0;
}
button:hover {
  border-color: #000000;
  border-width: 0;
}
</style>