<script setup lang="ts">

import {deleteLocalData, getAccountImg, getLocalData, setLocalData} from "../operation/dataOperation.ts";
import Icon_to_home from "./weight/icon_to_home.vue";
import router from "../router";
import {ref} from "vue";
import axios from 'axios';
import {getAddress} from "../operation/address.ts";
import Image_cutter from "./weight/image_cutter.vue";

const show_content = ref("需要怎样操作您的账户？")
const new_id = ref("")
const new_name = ref("")
const old_password = ref("")
const new_password = ref("")
const checkDelete = ref("")
const action = ref("")

function requestSetAccImg() {
    show_content.value = "定制您独特的头像风格"
    action.value = "setAccImg"
}

function setContentValue(s:string){
  show_content.value = s
}

function requestChangeName() {
    show_content.value = "您正在更改用户名，请输入新的用户名"
    action.value = "changeName"
}

async function sendNameChange() {
  show_content.value = "服务器正在处理中..."
  action.value = "serverAction"
  const axiosResponse = await axios.post(getAddress() + "/account", {
    mesType: 14,
    name: new_name.value,
    token: getLocalData("token")
  })

  const responseMess = axiosResponse.data.response
  if (responseMess == 'success') {
    show_content.value = `响亮的新名字！${axiosResponse.data.name}！`
    setLocalData('name',axiosResponse.data.name)
  } else if (responseMess == '登录已失效，请重新登录') {
    show_content.value = '登录已失效，请退出账户'
    action.value = "deleteAccount"
  } else if (responseMess == 'have_this_name') {
    show_content.value = '用户名已存在，请重新输入'
    action.value = "changeName"
  } else if (responseMess == '失败') {
    show_content.value = '服务器操作失败，请再次尝试'
    action.value = "changeName"
  } else if (responseMess == '请正确输入'){
    show_content.value = "输入格式有误，用户名应在2~16个字符之间"
    action.value = "changeName"
  } else {
    show_content.value = responseMess
    action.value = "changeName"
  }
}

function requestChangeId() {
    show_content.value = "您正在更改账号，请输入新的账号"
    action.value = "changeId"
}

async function sendIdChange() {
  show_content.value = "服务器正在处理中..."
  action.value = "serverAction"
  const axiosResponse = await axios.post( getAddress() + "/account", {
    mesType: 15,
    id: new_id.value,
    token: getLocalData("token")
  })

  const responseMess = axiosResponse.data.response
  if (responseMess == 'success') {
    show_content.value = `新账号：${axiosResponse.data.id}！`
    setLocalData('id',axiosResponse.data.id)
  } else if (responseMess == '登录已失效，请重新登录') {
    show_content.value = '登录已失效，请退出账户'
    action.value = "deleteAccount"
  } else if (responseMess == 'have_this_id') {
    show_content.value = '账号已存在，请重新输入'
    action.value = "changeId"
  } else if (responseMess == '失败') {
    show_content.value = '服务器操作失败，请再次尝试'
    action.value = "changeId"
  } else if (responseMess == '请正确输入'){
    show_content.value = "输入格式有误，账号应在5~16个字符之间"
    action.value = "changeId"
  } else {
    show_content.value = responseMess
    action.value = "changeId"
  }
}

function requestChangePwd() {
    show_content.value = "您正在更改密码，我们需要验证您的密码"
    action.value = "changePwd"
}

async function sendPwdChange() {
  show_content.value = "服务器正在处理中..."
  action.value = "serverAction"
  const axiosResponse = await axios.post(getAddress() + "/account", {
    mesType: 16,
    id: getLocalData("id"),
    old_password : old_password.value,
    password : new_password.value
  })

  const responseMess = axiosResponse.data.response
  if (responseMess == 'success') {
    show_content.value = `新的密码设置成功！`
    setLocalData('password',axiosResponse.data.password)
  } else if (responseMess == '登录已失效，请重新登录') {
    show_content.value = '登录已失效，请退出账户'
    action.value = "deleteAccount"
  } else if (responseMess == '密码错误') {
    show_content.value = '您输入的密码有误！'
    action.value = "changePwd"
  } else if (responseMess == '失败') {
    show_content.value = '服务器操作失败，请再次尝试'
    action.value = "changePwd"
  } else if (responseMess == '请正确输入'){
    show_content.value = "输入格式有误，密码应在5~16个字符之间"
    action.value = "changePwd"
  } else {
    show_content.value = responseMess
    action.value = "changePwd"
  }
}

function requestRemove() {
    show_content.value = "您正在删除您的账户，执行本操作之后您的账户包括所有信息在内将永远消失"
    action.value = "removeAccount"
}

function requestDelete() {
    show_content.value = "请确认您的退出登录操作："
    action.value = "deleteAccount"
}

async function deleteAccount() {
  const deleteRequest = await axios.post(getAddress() + "/account", {
    mesType: -1,
    token: getLocalData("token"),
  })

  deleteLocalData('id')
  deleteLocalData('name')
  deleteLocalData('token')
  console.log(deleteRequest.data.response)

  router.push("/")
}
</script>

<template>
  <div id="account_view">
    <div id="left_view">
      <icon_to_home/>
      <img id="account_img" :src="getAccountImg()" alt="">
      <div id="operation_choice">
        账户：{{getLocalData('id')}}
        <button @click="requestSetAccImg" style="margin-top: 10px">
          设置头像
        </button>
        <button @click="requestChangeName">
          更改用户名
        </button>
        <button @click="requestChangeId">
          更改账号
        </button>
        <button @click="requestChangePwd">
          更改密码
        </button>
        <button @click="requestRemove">
          删除账户
        </button>
        <button @click="requestDelete">
          退出登录
        </button>
      </div>
    </div>
    <div id="right_view">
      <div id="hello1">你好，{{ getLocalData("name") }}</div>
      <div id="hello2">{{show_content}}</div>

      <div class="secondView" v-if="action=='setAccImg'">
        <image_cutter :setContentValue="setContentValue"/>
      </div>

      <div class="secondView" v-if="action=='changeName'">
        新用户名：<br>
        <input v-model="new_name" style="width: calc(100% - 20px);margin-bottom: 10px">
        <button class="secondInput" @click="sendNameChange">
          确认更新用户名
        </button>
      </div>
      <div class="secondView" v-if="action=='changeId'">
        新账号：<br>
        <input v-model="new_id" style="width: calc(100% - 20px);margin-bottom: 10px">
        <button class="secondInput" @click="sendIdChange">
          确认更新账号
        </button>
      </div>
      <div class="secondView" v-if="action=='changePwd'">
        原密码：<br>
        <input v-model="old_password" style="width: calc(100% - 20px);margin-bottom: 10px">
        新密码：<br>
        <input v-model="new_password" style="width: calc(100% - 20px);margin-bottom: 10px">
        <button class="secondInput" @click="sendPwdChange">
          验证原密码以更新密码
        </button>
      </div>
      <div class="secondView" v-if="action=='removeAccount'">
        请在下面的输入栏中输入：<br>I need remove my account.<br>
        <input v-model="checkDelete" style="width: calc(100% - 20px);margin-bottom: 10px">
        <button class="secondInput" @click="">
          验证输入内容并确定删除（本功能暂时维护）
        </button>
      </div>
      <button class="action" v-if="action=='deleteAccount'" @click="deleteAccount">
        确认退出登录
      </button>
    </div>
  </div>
</template>

<style scoped>
.secondView {
  border-radius: 10px;
  margin: 20px 12%;
  padding: 20px;
  background: rgb(245, 245, 245);
}

.secondInput {
  width: 100%;
  height: 60px;
  margin: 0;
}

.action {
  height: 100px;
  width: 80%;
  margin-top: 40px;
  margin-left: 10%;
  margin-right: 10%;
  background: rgb(245, 245, 245);
}

#hello1 {
  padding: 3% 5% 0 5%;
  font-size: 60px;
  background: linear-gradient(45deg, #ec86ff, #34dbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

#hello2 {
  padding: 0 5% 0 5%;
  font-size: 40px;
  color: #bcbcbc;
}

button {
  color: #000000;
  background: white;
  width: calc(100% - 20px);
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
}

#account_view {
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
}

#operation_choice {
  display: flex;
  flex-direction: column;
  text-align: center;
  height: 100%;
  width: 100%;
  overflow: auto;
}

#left_view {
  font-size: 15px;
  color: #000000;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 25%;
  min-width: 200px;
  height: 100%;
  background: rgb(245, 245, 245);
}

#account_img {
  min-width: 90px;
  min-height: 90px;
  width: 90px;
  height: 90px;
  max-width: 90px;
  max-height: 90px;
  padding-top: 20px;
  padding-bottom: 10px;
  margin: auto;
}

#right_view {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
}
</style>