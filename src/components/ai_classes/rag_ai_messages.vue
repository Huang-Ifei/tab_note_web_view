<template>
  <div class="rag-chat-container">
    <!-- 电脑端 -->
    <div v-if="!smallScreen" id="rag_view">
      <div class="left_items">
        <div style="min-height: 54px;display: flex;align-items: center;padding: 0 10px;">
          <img class="back-btn" src="../../assets/arrow_back.svg" alt="返回" @click="router.back()" />
          <h1 class="left-title">AI 知识库问答</h1>
        </div>
        <div id="usrTalkHistory">
          <button @click="newChat" style="display: flex; align-items: center;justify-content: center;padding: 10px">
            <img src="../../assets/edit.svg" alt="edit" style="margin-right: 2px"/>
            新建对话
          </button>
          <div v-for="item in historyList" :key="item.rag_ms_id"
               @click="loadHistory(item.rag_ms_id)">
            <button v-if="ragMsId === item.rag_ms_id" style="outline: #009bff auto 1px">
              {{ item.mainly || '未命名对话' }}
            </button>
            <button v-else>
              {{ item.mainly || '未命名对话' }}
            </button>
          </div>
        </div>
        <div class="bottom_hidden"></div>
        <button onclick="location.href='login'" id="usr">
          <div @click="router.push('login')" style="width: auto;height: auto;padding-top: 5px">
            <img :src="getAccountImg()" style="width: 50px;height: 40px;padding: 0;margin: 0" alt="image"/>
          </div>
          <a href="/login" style="width: 100%;text-align: center;margin: 5px;color: #1a1a1a">
            {{ getLocalData('name') }}
          </a>
        </button>
      </div>
      <div class="ai_talking">
        <div id="talking_view" style="padding-top: 20px;">
          <div v-if="messages.length === 0 && ragMsId === ''">
            <div id="hello1">你好，{{ getLocalData("name") }}</div>
            <div id="hello2">欢迎使用基于知识库的AI问答</div>
          </div>
          <div class="contents_view" style="padding: 0 7%">
            <div v-for="(value, ii) in messages" :key="ii">
              <transition>
                <div v-if="value.role === 'assistant' && count > ii" class="model_talk">
                  <div style="display: flex;flex-direction: row;align-items: center;">
                    <img class="usr_img" :src="getAddress() + '/image?name=ai.jpg'" alt="AI"/>
                    <img @click="copyText(value.content.toString())" class="copy_img"
                         src="../../assets/content_copy.svg" alt="copy"/>
                    <img @click="redoAiMessage(ii)" class="copy_img"
                         src="../../assets/forward_media_gray.svg" alt="redo"/>
                  </div>
                  <div v-html="renderMd(value.content.toString())" class="content"></div>
                </div>
              </transition>
              <transition>
                <div v-if="value.role === 'user' && count > ii" class="usr_talk">
                  <div style="display: flex;flex-direction: row;align-items: center;">
                    <img @click="redoUsrMessage(ii)" class="copy_img"
                         src="../../assets/forward_media_gray.svg" alt="redo"/>
                    <img @click="copyText(value.content)" class="copy_img"
                         src="../../assets/content_copy.svg" alt="copy"/>
                    <img class="usr_img" :src="getAccountImg()" alt="usr"/>
                  </div>
                  <div v-html="escapeHTMLWithOutConsole(value.content)" class="content"
                       style="background: #009bff;color: white"></div>
                </div>
              </transition>
            </div>
            <Loading v-if="isLoading"/>
            <div v-if="streamText !== ''" class="model_talk">
              <img class="usr_img" :src="getAddress() + '/image?name=ai.jpg'" alt="AI"/>
              <div v-html="renderMd(streamText)" class="content"></div>
            </div>
          </div>
        </div>
        <div class="bottomInput">
          <div class="text_area_bg">
            <textarea id="textareaEl" v-model="text"
                      placeholder="输入问题..."/>
            <button @click="sendText">发送</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 手机端 -->
    <div v-else style="width: 100%;max-height: 100%;height: 100%;position: absolute;flex-direction: column;display: flex">
      <div style="position:absolute;top:0;left:0;height:54px;width:calc(100% - 16px - 16px);background:rgba(255,255,255,0.75);backdrop-filter:blur(10px);z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 16px;box-shadow:0 2px 10px rgba(0,0,0,0.1);font-weight: bold">
        <img class="back-btn" src="../../assets/arrow_back.svg" alt="返回" @click="router.back()" />
        AI知识库问答
        <div style="display:flex;align-items:center;gap:12px">
<!--          <img src="../../assets/edit.svg" style="height:20px;cursor:pointer" alt="new" @click="newChat"/>-->
          <img src="../../assets/menu_gray.svg" style="height:20px;cursor:pointer" alt="menu" @click="showDrawer = true"/>
        </div>
      </div>
      <div class="mobile-drawer" v-if="showDrawer" @click="showDrawer = false">
        <div class="drawer-content" @click.stop>
          <img src="../../assets/arrow_forward.svg" @click="showDrawer = false" class="close_button">
          <div style="min-height: 3px;display: flex;"></div>
          <button style="display: flex; align-items: center;justify-content: center;padding: 10px"
                  @click="newChat(); showDrawer = false" class="his_button">
            <img src="../../assets/edit.svg" alt="edit" style="margin-right: 2px"/>
            新建对话
          </button>
          <div style="min-height: 8px;display: flex;"></div>
          <div v-for="item in historyList" :key="item.rag_ms_id"
               @click="loadHistory(item.rag_ms_id); showDrawer = false">
            <button class="his_button" v-if="ragMsId === item.rag_ms_id" style="outline: #009bff auto 1px">
              {{ item.mainly || '未命名对话' }}
            </button>
            <button class="his_button" v-else>
              {{ item.mainly || '未命名对话' }}
            </button>
          </div>
        </div>
      </div>
      <div class="ai_talking" style="width: 100%;position: relative;max-height: 100%;">
        <div id="talking_view" style="padding-top: 54px;">
          <div v-if="messages.length === 0 && ragMsId === ''">
            <div id="hello1" style="font-size: 30px;font-weight: bold">{{ getLocalData("name") }}</div>
            <div id="hello2" style="font-size: 20px">你好，AI问答随时待命</div>
          </div>
          <div class="contents_view" style="width: 100%">
            <div v-for="(value, ii) in messages" :key="ii">
              <transition>
                <div v-if="value.role === 'assistant' && count > ii" class="model_talk">
                  <div style="display: flex;flex-direction: row;align-items: center;">
                    <img class="usr_img" :src="getAddress() + '/image?name=ai.jpg'" alt="AI"/>
                    <img @click="copyText(value.content.toString())" class="copy_img"
                         src="../../assets/content_copy.svg" alt="copy"/>
                    <img @click="redoAiMessage(ii)" class="copy_img"
                         src="../../assets/forward_media_gray.svg" alt="redo"/>
                  </div>
                  <div v-html="renderMd(value.content.toString())" class="content"></div>
                </div>
              </transition>
              <transition>
                <div v-if="value.role === 'user' && count > ii" class="usr_talk">
                  <div style="display: flex;flex-direction: row;align-items: center;">
                    <img @click="redoUsrMessage(ii)" class="copy_img"
                         src="../../assets/forward_media_gray.svg" alt="redo"/>
                    <img @click="copyText(value.content)" class="copy_img"
                         src="../../assets/content_copy.svg" alt="copy"/>
                    <img class="usr_img" :src="getAccountImg()" alt="usr"/>
                  </div>
                  <div v-html="escapeHTMLWithOutConsole(value.content)" class="content"
                       style="background: #009bff;color: white"></div>
                </div>
              </transition>
            </div>
            <Loading v-if="isLoading"/>
            <div v-if="streamText !== ''" class="model_talk">
              <img class="usr_img" :src="getAddress() + '/image?name=ai.jpg'" alt="AI"/>
              <div v-html="renderMd(streamText)" class="content"></div>
            </div>
          </div>
        </div>
        <div class="bottomInput" style="width: 100%">
          <div class="text_area_bg" style="width: calc(100% - 20px);padding-left: 10px;padding-right: 10px; margin: 10px;">
            <textarea id="textareaEl" v-model="text"
                      placeholder="输入问题..." style="width: calc(100% - 90px)"/>
            <button @click="sendText" style="width: 70px">发送</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeMount, onBeforeUnmount, Ref } from "vue"
import { useRoute } from "vue-router"
import { delay, renderMd, escapeHTMLWithOutConsole, getAccountImg, getLocalData, getTokenData, isApp } from "../../operation/dataOperation.ts"
import { getAddress } from "../../operation/address.ts"
import Loading from "../weight/loading.vue"
import router from "../../router"
import axios from "axios"

const route = useRoute()
const bookId = typeof route.query.book_id === 'string' ? route.query.book_id : ''

type talk = { role: string, content: string }

const messages = ref<talk[]>([])
const count = ref(0)
const text = ref("")
const streamText = ref("")
const isLoading = ref(false)
const ragMsId = ref("")
const historyList = ref<any[]>([])
const isLoadingHistory = ref(false)
const showDrawer = ref(false)
const smallScreen = ref(false)

onBeforeMount(() => {
  renderResize()
  window.addEventListener("resize", renderResize)
})
onBeforeUnmount(() => {
  window.removeEventListener("resize", renderResize)
})
const renderResize = () => {
  smallScreen.value = document.documentElement.clientWidth < 768 || isApp()
}

watch(text, async () => {
  await nextTick()
  const els = document.querySelectorAll('#textareaEl') as NodeListOf<HTMLTextAreaElement>
  els.forEach(el => {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  })
})

function sendText() {
  if (text.value.trim() !== "" && !isLoading.value) {
    send(text.value.trim())
    text.value = ""
  }
}

// 加载历史列表
async function loadHistoryList() {
  isLoadingHistory.value = true
  try {
    const tk = await getTokenData()
    const res = await axios.post(getAddress() + "/rag/historyList", {
      id: getLocalData('id'),
      token: tk,
      book_id: bookId
    })
    if (res.data.response === "success") {
      historyList.value = res.data.list || []
    } else if (res.data.response === "token_check_failed") {
      alert("登录已失效，请重新登录")
      await router.push("login")
    }
  } catch (e) {
    console.error("加载历史失败", e)
  } finally {
    isLoadingHistory.value = false
  }
}

// 加载某条历史对话详情
async function loadHistory(ragMsIdParam: string) {
  if (isLoading.value) return
  text.value = ""
  try {
    const tk = await getTokenData()
    const res = await axios.post(getAddress() + "/rag/historyDetail", {
      rag_ms_id: ragMsIdParam,
      token: tk
    })
    if (res.data.response === "success") {
      const contents = res.data.contents
      const rounds: talk[][] = contents?.messages || []
      messages.value = []
      count.value = 0
      ragMsId.value = res.data.rag_ms_id || ragMsIdParam
      for (const round of rounds) {
        for (const msg of round) {
          messages.value.push({ role: msg.role, content: msg.content })
        }
      }
      for (let i = 0; i < messages.value.length; i++) {
        await delay(150)
        count.value++
      }
    } else {
      alert(res.data.response || '加载失败')
    }
  } catch (e) {
    console.error("加载对话详情失败", e)
  }
}

// 新建对话
async function newChat() {
  if (isLoading.value) {
    alert("请等待加载完成")
    return
  }
  messages.value = []
  count.value = 0
  ragMsId.value = ""
  streamText.value = ""
}

async function send(s: string) {
  if (isLoading.value) {
    alert("请等待加载完成")
    return
  }
  messages.value.push({ role: 'user', content: s })
  await delay(200)
  count.value = messages.value.length
  await post()
}

async function post() {
  isLoading.value = true
  try {
    const tk = await getTokenData()
    const response = await fetch(
      getAddress() + "/rag/chat",
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({
          id: getLocalData('id'),
          messages: messages.value,
          subject: bookId,
          ai_ms_id: ragMsId.value || undefined,
          token: tk
        }),
      }
    )
    const allValue = ref("")
    if (response.body != null) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const decodeValue = new TextDecoder().decode(value)

        if (decodeValue.includes("}\n{")) {
          const parts = decodeValue.split("}\n{")
          for (let i = 0; i < parts.length; i++) {
            if (i === 0) {
              decodeJsonToShow(parts[i] + "}", allValue)
            } else if (i > 0 && i < parts.length - 1) {
              decodeJsonToShow("{" + parts[i] + "}", allValue)
            } else {
              decodeJsonToShow("{" + parts[i], allValue)
            }
          }
        } else {
          decodeJsonToShow(decodeValue, allValue)
        }
      }
      messages.value.push({ role: 'assistant', content: allValue.value })
      streamText.value = ""
      count.value = messages.value.length
      await delay(500)
      await loadHistoryList()
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
  isLoading.value = false
}

function decodeJsonToShow(decodeValue: string, allValue: Ref<string>) {
  try {
    const json = JSON.parse(decodeValue)
    if (json.ai_ms_id) {
      ragMsId.value = json.ai_ms_id
    }
    if (json.response === "success") {
      return
    }
    if (json.response === "stream") {
      allValue.value += json.message.content
      streamText.value = allValue.value
    }
  } catch (e) {
    console.error("parse error:" + e)
  }
}

function copyText(s: string) {
  const el = document.createElement('textarea')
  el.value = s
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.zIndex = '-100'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  alert('复制成功')
}

async function redoUsrMessage(ii: number) {
  if (isLoading.value) {
    alert("请等待加载完成")
    return
  }
  let newMessage: talk[] = []
  for (let i = 0; i < messages.value.length; i++) {
    if (i < ii) {
      newMessage.push(messages.value[i])
    } else if (i === ii) {
      text.value = messages.value[i].content.toString()
      if (count.value - newMessage.length > 3) {
        count.value = newMessage.length + 3
      }
      for (let j = count.value; j > newMessage.length; j--) {
        await delay(200)
        count.value--
      }
      await delay(250)
      messages.value = newMessage
      break
    }
  }
}

async function redoAiMessage(ii: number) {
  if (isLoading.value) {
    alert("请等待加载完成")
    return
  }
  let newMessage: talk[] = []
  for (let i = 0; i < messages.value.length; i++) {
    if (i < ii) {
      newMessage.push(messages.value[i])
    } else if (i === ii) {
      if (count.value - newMessage.length > 3) {
        count.value = newMessage.length + 3
      }
      for (let j = count.value; j > newMessage.length; j--) {
        await delay(200)
        count.value--
      }
      await delay(250)
      messages.value = newMessage
      await post()
    } else {
      break
    }
  }
}

onMounted(() => {
  loadHistoryList()
})
</script>

<style scoped>
@import "../../operation/ai-content.css";
.rag-chat-container {
  position: absolute;
  max-width: 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

#rag_view {
  position: absolute;
  max-width: 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.back-btn {
  height: 24px;
  width: 24px;
  cursor: pointer;
  margin-right: 10px;
  user-select: none;
}

.left-title {
  font-size: 17px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.left_items {
  position: relative;
  background: rgb(245, 245, 245);
  height: 100%;
  margin: 0;
  padding: 0;
  width: 260px;
  overflow: hidden;
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

.bottom_hidden {
  position: absolute;
  min-width: 260px;
  max-width: 260px;
  min-height: 90px;
  max-height: 90px;
  bottom: 52px;
  left: 0;
  background: linear-gradient(0deg, #f3f3f3 70%, rgba(255, 255, 255, 0));
}

#usr {
  font-size: 15px;
  color: #1c1c1c;
  margin: 7px 10px;
  display: flex;
  flex-direction: row;
  bottom: 0;
  left: 0;
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

.ai_talking {
  display: flex;
  flex-direction: column;
  width: calc(100% - 260px);
  height: 100%;
  overflow: hidden;
  vertical-align: bottom;
  position: relative;
  background: white;
}

.bottomInput {
  width: calc(100%);
  height: 100%;
  display: flex;
  align-items: flex-end;
  pointer-events: none;
  flex-direction: row;
  position: absolute;
}

.text_area_bg {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: row;
  align-items: end;
  width: 80%;
  margin: 10px 10%;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 12px;
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  pointer-events: visible;
}

#textareaEl {
  border: none;
  background: transparent;
  width: calc(100% - 100px);
  resize: none;
  min-height: 42px;
  height: 42px;
  padding: 10px;
  font-size: 15px;
  overflow: auto;
  max-height: 180px;
  outline: none;
}

#textareaEl:hover,
#textareaEl:focus,
#textareaEl:focus-visible {
  outline: none;
  box-shadow: none;
}

.text_area_bg button {
  height: 42px;
  width: 80px;
  padding: 0;
  margin: 5px 8px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
}

.text_area_bg button:hover {
  background: #2563eb;
}

#talking_view {
  max-width: 100%;
  height: 100%;
  padding-bottom: 120px;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
}

#hello1 {
  padding: 2% 5% 0 8%;
  font-size: 35px;
  font-weight: bold;
  background: linear-gradient(45deg, #ec86ff, #34dbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

#hello2 {
  padding: 0 5% 0 8%;
  font-size: 28px;
  color: #bcbcbc;
}

.contents_view {
  display: flex;
  flex-direction: column;
  width: 86%;
}

.model_talk {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  max-width: 100%;
  margin: 10px 20px 10px 10px;
  overflow: hidden;
}

.usr_talk {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  position: relative;
  max-width: 100%;
  margin: 10px 10px 10px 20px;
  overflow: hidden;
}

.content {
  position: relative;
  padding: 10px 10px 10px 10px;
  overflow-wrap: break-word;
  word-break: break-word;
  max-width: 100%;
  display: inline;
  margin: 5px;
  border-radius: 10px;
  background: #f1f1f1;
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

.back-btn {
  height: 24px;
  width: 24px;
  cursor: pointer;
  user-select: none;
}

/* 手机端侧滑 */
.mobile-drawer {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: absolute;
  display: flex;
  z-index: 580;
  justify-content: end;
}

.drawer-content {
  position: relative;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  background-color: rgba(250, 250, 250, 0.9);
  border-radius: 0;
  overflow: auto;
  display: flex;
  width: 70%;
  height: 100%;
  flex-direction: column;
  pointer-events: visible;
}

.close_button {
  width: fit-content;
  height: fit-content;
  background: transparent;
  padding: 15px 20px;
}

.his_button {
  width: calc(100% - 20px);
  margin-left: 10px;
  margin-right: 10px;
  color: #000000;
  background: white;
  margin-bottom: 8px;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
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
</style>
