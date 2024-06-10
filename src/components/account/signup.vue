<script setup lang="ts">

import Icon_to_home from "../weight/icon_to_home.vue";
import {ref} from "vue";
import axios from "axios";
import router from "../../router";
import * as Cookies from "js-cookie";
import {getAddress} from "../../operation/address.ts";

const placeholder = ref("账号")
const waitText = ref("")

const id = ref("")
const password = ref("")
const name = ref("")
const successChoice = ref(false)
const token = ref("")

const content = ref("")

async function check(){
  //账号验证
  if (content.value!=""&&id.value==""){
    waitText.value = "正在核验账号";
    try {
      const url = getAddress()+"/account_id_check?id="+content.value
      const response = await axios.get(url);
      if (response.data.response=='no_this_account') {
        const sys_mess = document.getElementById("sys_mess")
        if (sys_mess != null) {
          id.value = content.value;
          content.value = ""
          sys_mess.style.color='rgba(0, 0, 0, 0.85)';
          sys_mess.innerHTML = "您的账号已经通过验证，接下来请输入您想设置的密码"
          placeholder.value = "密码"
        }
      }else if(response.data.response=='have_this_account'){
        const sys_mess = document.getElementById("sys_mess")
        if (sys_mess != null) {
          sys_mess.style.color='rgba(209, 0, 0, 0.85)';
          sys_mess.innerHTML = "您的账号已被注册，账号作为您独一无二的识别码，不被允许重复，请您务必更换"
        }
      }else if(response.data.response=='id_is_bad'){
        const sys_mess = document.getElementById("sys_mess")
        if (sys_mess != null) {
          sys_mess.style.color='rgba(209, 0, 0, 0.85)';
          sys_mess.innerHTML = "账号创建失败，您输入的账号必非空且包含5~16个字符，并且不包含表情等特殊字符"
        }
      }else {
        const sys_mess = document.getElementById("sys_mess")
        if (sys_mess != null) {
          sys_mess.style.color='rgba(209, 0, 0, 0.85)'
          sys_mess.innerHTML = response.data.response
        }
      }
    } catch (error) {
      console.error('请求出错:', error)
    }
    waitText.value = ""
  }
  //密码验证
  else if(content.value!=""&&password.value==""){
    waitText.value = "正在核验密码";
    try {
      const url = getAddress()+"/account_password_check"
      const response = await axios.post(url,{password: content.value});
      if (response.data.response=='ok') {
        const sys_mess = document.getElementById("sys_mess")
        if (sys_mess != null) {
          password.value = content.value;
          content.value = ""
          sys_mess.style.color='rgba(0, 0, 0, 0.85)';
          sys_mess.innerHTML = "您的密码核验成功，接下来为你的账户起个响亮的名字吧"
          placeholder.value = "名字"
        }
      }else if(response.data.response=='password_is_bad'){
        const sys_mess = document.getElementById("sys_mess")
        if (sys_mess != null) {
          sys_mess.style.color='rgba(209, 0, 0, 0.85)';
          sys_mess.innerHTML = "密码创建失败，您输入的密码必非空且包含5~16个字符，并且不包含表情等特殊字符"
        }
      }else {
        const sys_mess = document.getElementById("sys_mess")
        if (sys_mess != null) {
          sys_mess.style.color='rgba(209, 0, 0, 0.85)'
          sys_mess.innerHTML = response.data.response
        }
      }
    } catch (error) {
      console.error('请求出错:', error)
    }
    waitText.value = ""
  }
  //名字验证
  else if(content.value!=""&&name.value==""){
    waitText.value = "正在核验用户名";
    try {
      const url = getAddress()+"/account_name_check?name="+content.value
      const response = await axios.get(url);
      if (response.data.response=='no_this_name') {
        waitText.value = ""
        const sys_mess = document.getElementById("sys_mess")
        const text_content = document.getElementById("text_content");
        if (sys_mess != null&&text_content != null){
          text_content.innerHTML = ""
          name.value = content.value;
          content.value = ""
          sys_mess.style.color='rgba(0, 0, 0, 0.85)';
          sys_mess.innerHTML = "一切已经准备就绪，大概几秒钟后您就能知道您的账户是否创建成功"
          placeholder.value = ""
          //最终注册
          const url = getAddress()+"/account"
          const response = await axios.post(url,{mesType: 0, id:id.value, password:password.value, name:name.value});
          if (response.data.response=='success') {
            sys_mess.innerHTML = "创建账户成功！"
            token.value = response.data.token
            successChoice.value = true
          }else{
            sys_mess.innerHTML = response.data.response
          }
        }
      }else if(response.data.response=='have_this_name'){
        const sys_mess = document.getElementById("sys_mess")
        if (sys_mess != null) {
          sys_mess.style.color='rgba(209, 0, 0, 0.85)';
          sys_mess.innerHTML = "您的用户名已被注册，用户名作为您最显著的特征，不被允许重复，请您务必更换"
        }
      }else if(response.data.response=='name_is_bad'){
        const sys_mess = document.getElementById("sys_mess")
        if (sys_mess != null) {
          sys_mess.style.color='rgba(209, 0, 0, 0.85)';
          sys_mess.innerHTML = "用户名创建失败，您输入的用户名必非空且包含2~16个字符，并且不包含表情等特殊字符"
        }
      }else {
        const sys_mess = document.getElementById("sys_mess")
        if (sys_mess != null) {
          sys_mess.style.color='rgba(209, 0, 0, 0.85)'
          sys_mess.innerHTML = response.data.response
        }
      }
    } catch (error) {
      console.error('请求出错:', error)
    }
    waitText.value = ""
  }
}

function saveCookieAndSignUp(){
  Cookies.default.set('id', id.value,{ expires: 1024 });
  Cookies.default.set('name', name.value,{ expires: 1024 });
  Cookies.default.set('token', token.value,{ expires: 1024 });

  sessionStorage.setItem('id', id.value);
  sessionStorage.setItem('name', name.value);
  sessionStorage.setItem('token', token.value);
  router.push('/')
}
function saveSessionAndSignUp(){
  console.log("saveSessionAndSignUp")
  sessionStorage.setItem('id', id.value);
  sessionStorage.setItem('name', name.value);
  sessionStorage.setItem('token', token.value);
  router.push('/')
}
</script>

<template>
  <div id="title">
    <icon_to_home/>
  </div>
  <div id="login_view">
    <div id="login_content">
      <h2>注册您的TabNote账户_</h2>
      <a id="signup" href="/login">已有账户？点此登录</a><br>
      <a id="sys_mess">首先，请输入一个账号，这将是您登录TabNote时独一无二的识别码</a>
      <br>
      <div id="text_content">
        <input type="text" id="id" v-model="content" :placeholder="placeholder"><br>
        <button id="button" @click='check' >
          验证->
        </button>
      </div>
      <button v-if="successChoice" @click='saveCookieAndSignUp' style='width: calc(50% - 5px);margin-right: 10px;background: #ffffff;color: #000000'>
        保存并登录
      </button>
      <button v-if="successChoice" @click='saveSessionAndSignUp' style='width: calc(50% - 5px);background: #ffffff;color: #000000'>
        仅本次登录
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
#sys_mess{
  color: rgba(0, 0, 0, 0.85);
}
#signup{
  cursor: pointer;
  color: #535bf2;
  position: relative;
  top: -5px;
  font-size: 14px;
}
#button{
  margin-top: 20px;
  margin-bottom: 10px;
  background: #000000;
  color: #ffffff;
  width: 100%;
  height: 42px;
  padding: 0;
}
#button:hover {
  border-color: #000000;
  border-width: 0;
}
</style>