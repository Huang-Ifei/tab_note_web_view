<script setup lang="ts">

import {
  deleteLocalData,
  getAccountImg,
  getLocalData,
  getTokenData,
  isApp,
  setLocalData
} from "../../operation/dataOperation.ts";
import Icon_to_home from "../weight/icon_to_home.vue";
import router from "../../router";
import {onBeforeMount, onBeforeUnmount, ref} from "vue";
import axios from 'axios';
import {getAddress} from "../../operation/address.ts";
import Image_cutter from "../weight/image_cutter.vue";

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

  const tk = await getTokenData()

  const axiosResponse = await axios.post(getAddress() + "/account", {
    mesType: 14,
    name: new_name.value,
    token: tk
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

  const tk = await getTokenData()

  const axiosResponse = await axios.post( getAddress() + "/account", {
    mesType: 15,
    id: new_id.value,
    token: tk
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

  const tk = await getTokenData()

  const deleteRequest = await axios.post(getAddress() + "/account", {
    mesType: -1,
    token: tk,
  })

  deleteLocalData('id')
  deleteLocalData('name')
  deleteLocalData('token')
  console.log(deleteRequest.data.response)

  await router.push("/")
  window.location.reload()
}

//监听大小
onBeforeMount(() => {
  renderResize();
  window.addEventListener("resize", renderResize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", renderResize);
});
const smallScreen = ref(false);
const renderResize = () => {
  let width = document.documentElement.clientWidth;
  if (width < 680||isApp()) {
    smallScreen.value = true;
  }
      //else if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      //  smallScreen.value = true;
  //}
  else {
    smallScreen.value = false;
  }
}

getRank()
const rank = ref(0)
async function getRank(){
  const response = await axios.get(getAddress()+"/vip/rank?id="+getLocalData("id"))
  rank.value = response.data.rank
}

</script>

<template>
  <icon_to_home/>
  <div style="min-height: 54px">

  </div>
  <div id="account_view" v-if="!smallScreen">
    <div id="left_view">
      <img id="account_img" :src="getAccountImg()" alt="">
      <div id="operation_choice">
        <p style="font-size: 18px;font-weight: bold;color: #282f37">{{getLocalData('name')}}</p>
        <p style="font-size: 14px;color: #8a8a8a">{{getLocalData('id')}}</p>
        <img v-if="rank==2" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA.svg" style="height: 25px"/>
        <img v-if="rank==4" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA+.svg" style="height: 25px"/>
        <img v-if="rank==6" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA++.svg" style="height: 25px"/>
        <button @click="router.push('afa')" style="margin-top: 10px;border-radius: 10px">
          获取高级功能授权
        </button>

        <button @click="requestSetAccImg" style="margin-top: 20px;border-radius: 10px 10px 0 0">
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
        <button @click="requestDelete" style="border-bottom: #f2f2f2 solid 1px;border-radius: 0 0 10px 10px">
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

  <div v-if="smallScreen" style="display: flex;flex-direction: column;overflow: auto;background-color:rgba(242, 242, 242, 0.8);height: calc(100% - 54px);position: absolute;width: 100%">
    <img id="account_img" :src="getAccountImg()" alt="" @click="requestSetAccImg" style="margin-top: 15px;">
    <div id="operation_choice" style="margin-right: 20px;margin-left: 20px;width: calc(100% - 40px)">
      <p style="font-size: 20px;font-weight: bold;color: #282f37">{{getLocalData('name')}}</p>
      <p style="font-size: 16px;color: #8a8a8a;margin-bottom: 5px">{{getLocalData('id')}}</p>
      <img v-if="rank==2" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA.svg" style="height: 25px"/>
      <img v-if="rank==4" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA+.svg" style="height: 25px"/>
      <img v-if="rank==6" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA++.svg" style="height: 25px"/>
      <button @click="router.push('afa')" style="margin-top: 12px;margin-bottom: 20px;border-radius: 10px">
        获取高级功能授权
      </button>
      <button @click="requestChangeName" style="border-radius:10px 10px 0 0 ">
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
      <button @click="requestDelete" style="border-radius: 0 0 10px 10px">
        退出登录
      </button>
    </div>
    <div v-if="action!=''" style="position: absolute;width: 100%;height: 100% ; display: flex;flex-direction: column;justify-content: center;align-items: center;overflow: auto;background: rgba(28,28,28,0.5)" @click="action=''">
      <div style="pointer-events: visible;" @click.stop>
        <div class="secondView" v-if="action=='setAccImg'">
          <image_cutter :setContentValue="setContentValue"/>
        </div>

        <div class="secondView" v-if="action=='changeName'">
          <p style="padding: 0;font-size: 1rem;margin: 0 0 10px;" v-if="show_content!=''">{{show_content}}</p>
          <input v-model="new_name" style="width: calc(100% - 20px);margin-bottom: 10px">
          <button class="secondInput" @click="sendNameChange">
            确认更新用户名
          </button>
        </div>
        <div class="secondView" style="max-width: 100vw;width: fit-content" v-if="action=='serverAction'">
          {{show_content}}
        </div>
        <div class="secondView" v-if="action=='changeId'">
          <p style="padding: 0;margin: 0 0 10px;font-size: 1rem" v-if="show_content!=''">{{show_content}}</p>
          <input v-model="new_id" style="width: calc(100% - 20px);margin-bottom: 10px">
          <button class="secondInput" @click="sendIdChange">
            确认更新账号
          </button>
        </div>
        <div class="secondView" v-if="action=='changePwd'">
          <p style="padding: 0;margin: 0 0 10px;font-size: 1rem" v-if="show_content!=''">{{show_content}}</p>
          原密码：<br>
          <input v-model="old_password" style="width: calc(100% - 20px);margin-bottom: 10px">
          新密码：<br>
          <input v-model="new_password" style="width: calc(100% - 20px);margin-bottom: 10px">
          <button class="secondInput" @click="sendPwdChange">
            验证原密码以更新密码
          </button>
        </div>
        <div class="secondView" v-if="action=='removeAccount'">
          <p style="padding: 0;margin: 0 0 10px;font-size: 1rem" v-if="show_content!=''">{{show_content}}</p>
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
  </div>
</template>

<style scoped>
.secondView {
  border-radius: 10px;
  margin: 20px 12%;
  padding: 20px;
  background-color: rgb(243, 243, 243,0.9);
  backdrop-filter: blur(10px);
}

.secondInput {
  border-radius: 10px;
  width: 100%;
  height: 60px;
  margin: 0;
}

.action {
  border-radius: 10px;
  height: 100px;
  width: 80%;
  margin-top: 40px;
  margin-left: 10%;
  margin-right: 10%;
  background: rgb(245, 245, 245);
}

#hello1 {
  padding: 3% 5% 0 5%;
  font-size: 45px;
  font-weight: bold;
  background: linear-gradient(45deg, #ec86ff, #34dbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

#hello2 {
  padding: 0 5% 0 5%;
  font-size: 35px;
  color: #bcbcbc;
}

button {
  color: #000000;
  background: white;
  width: calc(100% - 30px);
  margin:0 15px;
  padding: 1.7vh;
  border-radius: 0;
  border-left: #f2f2f2 solid 1px;
  border-right: #f2f2f2 solid 1px;
  border-top: #f2f2f2 solid 1px;
  border-bottom: #f2f2f2 solid 0;
}

#account_view {
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
  height: calc(100% - 54px);
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
  min-width: 300px;
  height: 100%;
  background-color: rgba(242, 242, 242, 0.8);
}

#account_img {
  min-width: 90px;
  min-height: 90px;
  width: 90px;
  height: 90px;
  max-width: 90px;
  max-height: 90px;
  border-radius: 90px;
  margin-top: 20px;
  margin-bottom: 10px;
  margin-left: auto;
  margin-right: auto;
}

#right_view {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: auto;
  height: 100%;
  width: 100%;
}
</style>