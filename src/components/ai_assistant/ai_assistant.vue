<script setup lang="ts">
import resize_textarea from "../weight/resize_textarea.vue";
import {onBeforeMount, onBeforeUnmount, Ref, ref} from "vue";
import {
  delay,
  escapeHTML,
  escapeHTMLWithOutConsole,
  getAccountImg,
  getLocalData, getTokenData,
  isApp
} from "../../operation/dataOperation.ts";
import {getAddress} from "../../operation/address.ts";
import axios from "axios";
import Small_ai_title from "./small_ai_title.vue";
import Wide_ai_icon_to_home from "./wide_ai_icon_to_home.vue";
import Small_right_choice from "./small_right_choice.vue";
import Loading from "../weight/loading.vue";
import router from "../../router";

const right_choice = ref(false)

type talk = {
  role: string,
  content: string
}

const messages: Ref<talk[]> = ref([])
const aiHistory: Ref<{}[]> = ref([])

const count = ref(0)
const ai_ms_id = ref("")
const text = ref("");
const streamText = ref("")
const isLoading = ref(false)

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
  if (width < 680 || isApp()) {
    smallScreen.value = true;
  } else {
    smallScreen.value = false;
  }
}

//发送信息并获取内容流式传输
async function post() {
  if (!isLoading.value) {
    isLoading.value = true
    console.log(messages.value)
    try {
      const tk = await getTokenData()
      // 发起 POST 请求
      const response = await fetch(
          getAddress() + "/ai/messages",
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify({
              ai_ms_id: ai_ms_id.value,
              messages: messages.value,
              preview: true,
              model: 'gpt-4o-mini',
              id: getLocalData('id'),
              token: tk
            }),
          }
      );
      console.log(JSON.stringify({messages: messages.value}));
      const allValue = ref("")
      if (response.body != null) {
        // 请求成功，处理返回的数据
        const reader = response.body.getReader()
        while (true) {
          const {done, value} = await reader.read()
          if (done) break
          const decodeValue = new TextDecoder().decode(value)
          console.log(decodeValue);
          //如果语段粘黏，分开！
          if (decodeValue.includes("}\n{")) {
            console.log("it take's two");
            const errDecodeValue = decodeValue.split("}\n{")
            for (let i = 0; i < errDecodeValue.length; i++) {
              if (i == 0) {
                console.log(i + ":" + errDecodeValue[i] + "}");
                decodeJsonToShow(errDecodeValue[i] + "}", allValue)
              } else if (i > 0 && i < errDecodeValue.length - 1) {
                console.log(i + ":" + errDecodeValue[i] + "}");
                decodeJsonToShow("{" + errDecodeValue[i] + "}", allValue)
              } else if (i == errDecodeValue.length - 1) {
                console.log(i + ":" + errDecodeValue[i] + "}");
                decodeJsonToShow("{" + errDecodeValue[i], allValue)
              }
            }
          } else {
            decodeJsonToShow(decodeValue, allValue)
          }
        }
        messages.value.push({role: 'assistant', content: allValue.value})
        streamText.value = ""
        count.value = messages.value.length
        await delay(500)
        await getAiHistory()
      }
    } catch (error) {
      // 请求失败，处理错误
      console.error('Error fetching data:', error);
    }
    isLoading.value = false
  } else {
    alert("请等待加载完成，若出错请刷新网页")
  }
}

function decodeJsonToShow(decodeValue: string, allValue: Ref<string>) {
  //如果是末尾条，添加返回的ai表id：
  if (decodeValue.startsWith('{"response":"')) {
    console.log(JSON.parse(decodeValue).response)
    try {
      ai_ms_id.value = JSON.parse(decodeValue).response

      streamText.value = ""
      count.value = messages.value.length
    } catch (e) {
      console.error("done but:" + e)
    }
  } else {
    try {
      allValue.value += JSON.parse(decodeValue).message.content
      streamText.value = ""
      streamText.value = allValue.value
    } catch (e) {
      console.error("get mess but:" + e)
    }
  }
}

//初始历史列表
getAiHistory()

//获取历史列表
async function getAiHistory() {
  try {
    const tk = await getTokenData()
    const response = await axios.post(getAddress() + "/ai/get_history", {
      id: getLocalData("id"),
      token: tk
    });
    if (response.data.response == "token_check_failed") {
      alert("登录已经失效，请重新登录")
    } else {
      aiHistory.value = response.data.list
      console.log(aiHistory.value)
    }
  } catch (error) {
    console.error(error)
  }
}

//新建对话
async function newChat() {
  if (!isLoading.value) {
    const talking_view = document.getElementById("contents_view")
    if (talking_view) {
      talking_view.innerHTML = ""
    }
    count.value = 0
    text.value = ''
    ai_ms_id.value = ''
    messages.value = []
  } else {
    alert("请等待加载完成，若出错请刷新网页")
  }
}

//获取历史对话
async function getHistoryAiMessages(aiMsId: string) {
  if (!isLoading.value) {
    text.value = ''
    try {
      const tk = await getTokenData()
      const response = await axios.post(getAddress() + "/ai/history", {
        id: getLocalData("id"),
        token: tk,
        ai_ms_id: aiMsId
      });
      //重置
      count.value = 0
      const talking_view = document.getElementById("contents_view")
      if (talking_view) {
        talking_view.innerHTML = ""
      }
      messages.value = response.data.messages[0]
      //重置所有的数据并一一添加
      ai_ms_id.value = aiMsId
      for (let i = 0; i < messages.value.length; i++) {
        await delay(200)
        count.value++
      }
    } catch (error) {
      console.error(error)
    }
  } else {
    alert("请等待加载完成，若出错请刷新网页")
  }
}

function setText(value: string) {
  text.value = value;
}

async function addUsrMess(s: string) {
  //添加到messages里面
  messages.value.push({role: 'user', content: s})
  await delay(200)
  count.value = messages.value.length
}

async function send(s: string) {
  if (!isLoading.value) {
    text.value = s;
    await addUsrMess(s)
    await post()
  } else {
    alert("请等待加载完成，若出错请刷新网页")
  }
}

function copyText(s: string) {
  //创建一个textarea并且放在-100层，并且提交一个copy操作
  const el = document.createElement('textarea');
  el.value = s;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.zIndex = '-100'
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  alert('复制成功')
}

async function redoUsrMessage(ii: number) {
  if (!isLoading.value) {
    let newMessage: talk[] = []
    for (let i = 0; i < messages.value.length; i++) {
      if (i < ii) {
        newMessage.push(messages.value[i])
      } else if (i == ii) {
        setText(messages.value[i].content)

        if (count.value - newMessage.length > 3) {
          count.value = newMessage.length + 3
        }
        for (let i = count.value; i > newMessage.length; i--) {
          await delay(200)
          count.value--
        }
        await delay(250)
        messages.value = newMessage
        break;
      }
    }
  } else {
    alert("请等待加载完成，若出错请刷新网页")
  }
}

async function redoAiMessage(ii: number) {
  if (!isLoading.value) {
    let newMessage: talk[] = []
    for (let i = 0; i < messages.value.length; i++) {
      if (i < ii) {
        newMessage.push(messages.value[i])
      } else if (i == ii) {
        if (count.value - newMessage.length > 3) {
          count.value = newMessage.length + 3
        }
        for (let iii = count.value; iii > newMessage.length; iii--) {
          await delay(200)
          count.value--
        }
        await delay(250)
        messages.value = newMessage

        console.log(messages.value)

        await post()
      } else {
        break;
      }
    }
  } else {
    alert("请等待加载完成，若出错请刷新网页")
  }
}

</script>

<template>
  <!--电脑端-->
  <div id="ai_view" v-if="!smallScreen">
    <div class="left_items">
      <wide_ai_icon_to_home/>
      <div id="usrTalkHistory">
        <div style="min-height: 57px;display: flex;">

        </div>
        <button @click="newChat" style="display: flex; align-items: center;justify-content: center;padding: 10px">
          <img src="../../assets/edit.svg" alt="edit" style="margin-right: 2px"/>
          新建对话
        </button>
        <button @click="router.push('note_ai')"
                style="display: flex; align-items: center;justify-content: center;padding: 10px">
          <img src="../../assets/edit_note.svg" alt="edit" style="margin-right: 2px"/>
          笔记型AI
        </button>
        <div style="min-height: 8px;display: flex;">

        </div>
        <div v-for="value in aiHistory" :key="JSON.parse(JSON.stringify(value)).ai_ms_id"
             @click="getHistoryAiMessages(JSON.parse(JSON.stringify(value)).ai_ms_id.toString())">
          <button v-if="ai_ms_id==JSON.parse(JSON.stringify(value)).ai_ms_id.toString()"
                  style="outline: #009bff auto 1px">
            {{ JSON.parse(JSON.stringify(value)).mainly }}
          </button>
          <button v-else>
            {{ JSON.parse(JSON.stringify(value)).mainly }}
          </button>
        </div>
      </div>
      <div class="bottom_hidden">

      </div>
      <button onclick="location.href='login'" id="usr">
        <button onclick="location.href='login'" style="width: auto;height: auto">
          <img id="usrImage" :src="getAccountImg()" style="width: 50px;margin-top: 5px;height: auto" alt="image"/>
        </button>
        <a href="/login" style="width: 100%;text-align: center;margin: 5px;color: #1a1a1a">
          {{ getLocalData('name') }}
        </a>
      </button>
    </div>
    <div class="ai_talking">
      <div id="talking_view" style=" padding-top: 20px;">
        <div v-if="messages.length==0&&ai_ms_id==''">
          <div id="hello1">你好，{{ getLocalData("name") }}</div>
          <div id="hello2"></div>
        </div>
        <div class="contents_view" style="padding: 0 7%">
          <div v-for="(value,ii) in messages" :key="ii">
            <transition>
              <div v-if="(value.role=='assistant'||value.role=='model')&&count>ii" class="model_talk">
                <div style="display: flex;flex-direction: row;align-items: center;">
                  <img class="usr_img" :src="getAddress()+'/image?name=ai.jpg'" alt="AI"/>
                  <img @click="copyText(value.content)" class="copy_img"
                       src="../../assets/content_copy.svg" alt="copy"/>
                  <img @click="redoAiMessage(ii)" class="copy_img" src="../../assets/forward_media_gray.svg"
                       alt="copy"/>
                </div>
                <div v-html="escapeHTML(value.content)" class="content">
                </div>
              </div>
            </transition>
            <transition>
              <div v-if="value.role=='user'&&count>ii" class="usr_talk">
                <div style="display: flex;flex-direction: row;align-items: center;">
                  <img @click="redoUsrMessage(ii)" class="copy_img" src="../../assets/forward_media_gray.svg"
                       alt="copy"/>
                  <img @click="copyText(value.content)" class="copy_img"
                       src="../../assets/content_copy.svg" alt="copy"/>
                  <img class="usr_img" :src="getAccountImg()" alt="usr"/>
                </div>
                <div v-html="escapeHTMLWithOutConsole(value.content)" class="content"
                     style="background: #009bff;color: white">
                </div>
              </div>
            </transition>
          </div>
          <loading v-if="isLoading"/>
          <div v-if="streamText!=''" class="model_talk">
            <img class="usr_img" :src="getAddress()+'/image?name=ai.jpg'" alt="AI"/>
            <div v-html="escapeHTML(streamText)" class="content">
            </div>
          </div>
        </div>
      </div>
      <div class="bottomInput">
        <resize_textarea @doSend="send" :smallScreen="false" v-model="text"/>
      </div>
    </div>
  </div>

  <!--手机端-->
  <div v-if="smallScreen"
       style="width: 100%;max-height: 100%;height: 100%;position: absolute;flex-direction: column;display: flex">
    <small_ai_title :smallScreen="smallScreen" @rightChoice="right_choice=true"/>
    <div class="ai_talking" style="width: 100%;position: relative;max-height: 100%;">
      <div id="talking_view">
        <!--初始画面-->
        <div v-if="messages.length==0&&ai_ms_id==''">
          <div id="hello1" style="font-size: 40px;font-weight: bold">{{ getLocalData("name") }}</div>
          <div id="hello2" style="font-size: 30px">你好，AI助手随时待命</div>
          <div style="margin-top: 20px;margin-left: 20px;font-weight: bold;font-size: 18px">
            TabNote特色AI功能
          </div>
          <div
              style="width: 100%;overflow-x: auto;display: flex;flex-direction: row;color: #434343">
            <div @click="router.push('beat_question')" style="margin-left: 20px" class="others_action">
              <img alt="相机" style="width: 70px;height: 70px" src="../../assets/camera.svg"/>
              AI识题(内测版)
            </div>
            <div @click="router.push('note_ai')" class="others_action">
              <img alt="笔记" style="width: 70px;height: 70px" src="../../assets/edit_note_gray.svg"/>
              笔记型AI
            </div>
          </div>
        </div>
        <div class="contents_view">
          <div v-for="(value,ii) in messages" :key="ii">
            <transition>
              <div v-if="(value.role=='assistant'||value.role=='model')&&count>ii" class="model_talk">
                <div style="display: flex;flex-direction: row;align-items: center;">
                  <img class="usr_img" :src="getAddress()+'/image?name=ai.jpg'" alt="AI"/>
                  <img @click="copyText(value.content)" class="copy_img"
                       src="../../assets/content_copy.svg" alt="copy"/>
                  <img @click="redoAiMessage(ii)" class="copy_img" src="../../assets/forward_media_gray.svg"
                       alt="copy"/>
                </div>
                <div v-html="escapeHTML(value.content)" class="content">
                </div>
              </div>
            </transition>
            <transition>
              <div v-if="value.role=='user'&&count>ii" class="usr_talk">
                <div style="display: flex;flex-direction: row;align-items: center;">
                  <img @click="redoUsrMessage(ii)" class="copy_img" src="../../assets/forward_media_gray.svg"
                       alt="copy"/>
                  <img @click="copyText(value.content)" class="copy_img"
                       src="../../assets/content_copy.svg" alt="copy"/>
                  <img class="usr_img" :src="getAccountImg()" alt="usr"/>
                </div>
                <div v-html="escapeHTMLWithOutConsole(value.content)" class="content"
                     style="background: #009bff;color: white">
                </div>
              </div>
            </transition>
          </div>
          <loading v-if="isLoading"/>
          <div v-if="streamText!=''" class="model_talk">
            <img class="usr_img" :src="getAddress()+'/image?name=ai.jpg'" alt="AI"/>
            <div v-html="escapeHTML(streamText)" class="content">
            </div>
          </div>
        </div>
      </div>
      <div class="bottomInput" style="width: 100%">
        <resize_textarea @doSend="send" :smallScreen="true" v-model="text"/>
      </div>
    </div>
  </div>
  <transition name="small_right_choice">
    <small_right_choice v-if="right_choice" @getHistoryAiMessages="getHistoryAiMessages"
                        @rightClose="right_choice=false" @newChat="newChat" :mess_list="aiHistory"
                        :ai_ms_id="ai_ms_id"/>
  </transition>
</template>

<style scoped>
.small_right_choice-enter-active,
.small_right_choice-leave-active {
  transition: opacity 0.25s ease;
}

.small_right_choice-enter-from,
.small_right_choice-leave-to {
  opacity: 0;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.model_talk {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  max-width: 100%;
  margin: 10px 20px 10px 10px;
}

.usr_talk {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: end;
  position: relative;
  max-width: 100%;
  margin: 10px 10px 10px 20px;
}

.content {
  position: relative;
  padding: 10px 10px 10px 10px;
  overflow-wrap: break-word;
  overflow-x: hidden;
  width: fit-content;
  max-width: calc(100% - 30px);
  display: inline;
  margin: 5px;
  border-radius: 10px;
  background: #f1f1f1;
}

#hello1 {
  padding: 1% 5% 0 5%;
  font-size: 60px;
  background: linear-gradient(45deg, #ec86ff, #34dbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bottom_hidden {
  position: absolute;
  min-width: 260px;
  max-width: 260px;
  min-height: 90px;
  max-height: 90px;
  top: calc(100% - 80px);
  background: linear-gradient(0deg, #f3f3f3 70%, rgba(255, 255, 255, 0));
  backdrop-filter: ;

}

#usrTalkHistory {
  width: 100%;
  height: calc(100% - 70px);
  padding-bottom: 70px;
  background: #f3f3f3;
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  overflow: auto;
}

#usrTalkHistory button {
  width: calc(100% - 20px);
  margin-left: 10px;
  margin-right: 10px;
  color: #000000;
  background: white;
  margin-bottom: 10px;
}

#hello2 {
  padding: 0 5% 0 5%;
  font-size: 40px;
  color: #bcbcbc;
}

#ai_view {
  position: absolute;
  max-width: 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

#contents_view {
  display: flex;
  flex-direction: column;
  width: 100%;
}

#talking_view {
  max-width: 100%;
  height: 100%;
  padding-bottom: 65px;
  padding-top: 54px;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
}

.left_items {
  position: relative;
  background: rgb(245, 245, 245);
  height: calc(100% - 10px);
  margin: 0;
  padding: 0;
  width: 260px;
}

.ai_talking {
  display: flex;
  flex-direction: column;
  width: calc(100% - 260px);
  height: 100%;
  overflow: auto;
  vertical-align: bottom;
}

.bottomInput {
  width: calc(100% - 260px);
  height: 100%;
  display: flex;
  align-items: end;
  pointer-events: none;
  flex-direction: row;
  position: absolute;
}

#usr {
  font-size: 15px;
  color: #1c1c1c;
  margin: 7px 10px;
  display: flex;
  flex-direction: row;
  top: calc(100% - 60px);
  padding-left: 15px;
  width: calc(100% - 20px);
  height: 52px;
  position: absolute;
  align-items: center;
  justify-items: center;
  background: #ffffff;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
}

#usr button {
  border-radius: 50%;
  width: 42px;
  height: 42px;
  background: #ffffff;
  padding: 1px;
}

#usr img {
  border-radius: 50%;
  width: 38px;
  height: 38px;
}

.usr_img {
  border-radius: 50%;
  margin: 2px 5px;
  width: 40px;
  height: 40px;
}

.copy_img {
  cursor: pointer;
  border-radius: 50%;
  margin: 10px 5px 2px 5px;
  width: 22px;
  height: 22px;
}

::-webkit-scrollbar {
  width: 5px;
  height: 0;
  background-color: transparent;
  border: none;
  outline: none;
}

::-webkit-scrollbar-thumb {
  background-color: #8a8a8a;
  border-radius: 10px;
  border: none;
  outline: none;
}

.others_action {
  min-width: 200px;
  height: 200px;
  margin: 10px 10px 10px 10px;
  background: #f5f5f5;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>