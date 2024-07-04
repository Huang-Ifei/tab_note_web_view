<script setup lang="ts">

import {
  delay,
  escapeHTML,
  escapeHTMLWithOutConsole,
  getLocalData,
  htmlToString,
  isApp
} from "../../operation/dataOperation.ts";
import Note_ai_title from "./note_ai_title.vue";
import Artificial_emoji from "../ai_emoji/artificial_emoji.vue";
import {onBeforeMount, onBeforeUnmount, Ref, ref} from "vue";
import axios from "axios";

import {getAddress} from "../../operation/address.ts";
import Note_ai_right_choice from "./note_ai_right_choice.vue";
import Note_ai_action_button from "./note_ai_action_button.vue";

const note_ai_id = ref('')
const note_tick: Ref<note_ai[]> = ref([])
const note_and_tick: Ref<note_or_tick[]> = ref([])
const rightChoice = ref(false)
const ai_history: Ref<{}[]> = ref([])
const all_text = ref('')
const alr = ref("")

//初始化
note_and_tick.value.push({type: "content", content: "", bz: ""})
try {
  getNoteAiHistory()
} catch (e) {
  console.error(e)
}

function newNoteAi() {
  note_and_tick.value = [{type: "content", content: "", bz: ""}]
  note_tick.value = []
  note_ai_id.value = ""
}

function getWholeText(): string {
  let s = ""
  let count = 0;
  for (let nt of note_and_tick.value) {
    if (nt.type == "content") {
      s += htmlToString(document.getElementById(count.toString())?.innerHTML || '')
    } else if (nt.type == "high-light") {
      s += nt.content
    }
    count++
  }
  htmlToString("ss:" + s)
  return s
}

async function pasteText(i: number) {
  const display = document.getElementById(i.toString());
  if (display) {
    await delay(200)
    const text = document.getElementById(i.toString())?.innerText || ''
    display.innerHTML = ""
    display.innerHTML = escapeHTMLWithOutConsole(text)
  }
  all_text.value = getWholeText()
}

//选择操作
const selectedText = ref("")

const handleSelect = () => {
  const selection = window.getSelection();
  if (selection) {
    selectedText.value = selection.toString()
  }
};


type note_ai = {
  sd: string;
  question: string;
  note: string
}

type note_or_tick = {
  type: string;
  content: string;
  bz: string
}

async function removeNote(sd: string, content: string) {
  let new_note_tick: note_ai[] = []

  console.log(note_tick.value.length + ":cc1")
  console.log(note_tick.value)
  for (let tick of note_tick.value) {
    if ((tick.sd == sd && tick.note == content)||tick.sd == sd && content == "问："+tick.question+"\n答："+tick.note) {

    }else{
      console.log(tick.note+":note:"+content)
      new_note_tick.push(tick)
    }
  }

  note_tick.value = new_note_tick
  console.log(note_tick.value.length + ":cc2")
  console.log(note_tick.value)
  const text = getWholeText()
  await loadNote(text)
  try {
    await pushNoteAiToServer(note_tick.value, text, note_ai_id.value)
  } catch (e) {
    console.error(e)
  }
}

async function loadNote(s: string) {
  note_and_tick.value = []

  note_and_tick.value = [{type: "content", content: s, bz: ""}]

  console.log(note_tick.value)

  for (let n of note_tick.value) {
    await delay(1)
    addNoteWithOutPushToServer(n.sd, n.question, n.note)
  }

  try {
    if (note_and_tick.value[note_and_tick.value.length - 1].type != 'content') {
      note_and_tick.value.push({type: "content", content: "", bz: ""})
    }
  } catch (e) {
    note_and_tick.value.push({type: "content", content: "", bz: ""})
    console.error(e)
  }
}

function addNoteWithOutPushToServer(sd: string, question: string, note: string) {

  for (let i = 0; i < note_and_tick.value.length; i++) {
    if (note_and_tick.value[i].type == "content") {
      note_and_tick.value[i].content = htmlToString(document.getElementById(i.toString())?.innerHTML || '')
    }
  }

  let new_note_and_tick = note_and_tick.value
  note_and_tick.value = []

  for (let ii = 0; ii < new_note_and_tick.length; ii++) {
    let newContent = ""
    let a = new_note_and_tick[ii].content
    let basic = new_note_and_tick[ii].type
    for (let i = 0; i < a.length; i++) {
      if (a.substring(i, i + sd.length) == sd) {
        if (newContent != '') {
          note_and_tick.value.push({type: basic, content: newContent, bz: new_note_and_tick[ii].bz})
        }
        newContent = ""
        note_and_tick.value.push({type: "high-light", content: sd, bz: ""})
        if (question != '') {
          note_and_tick.value.push({type: "tick", content: "问：" + question + "\n答：" + note, bz: sd})
        } else {
          note_and_tick.value.push({type: "tick", content: note, bz: sd})
        }
        i = i + sd.length - 1
      } else {
        newContent += a.charAt(i)
      }
    }
    if (newContent != '') {
      note_and_tick.value.push({type: basic, content: newContent, bz: new_note_and_tick[ii].bz})
    }
  }

  try {
    if (note_and_tick.value[note_and_tick.value.length - 1].type != 'content') {
      note_and_tick.value.push({type: "content", content: "", bz: ""})
    }
  } catch (e) {
    note_and_tick.value.push({type: "content", content: "", bz: ""})
  }

}

async function addNote(sd: string, question: string, note: string) {
  note_tick.value.push({sd: sd, question: question, note: note});
  console.log("length:" + note_tick.value.length)
  const text = getWholeText()

  for (let i = 0; i < note_and_tick.value.length; i++) {
    if (note_and_tick.value[i].type == "content") {
      note_and_tick.value[i].content = htmlToString(document.getElementById(i.toString())?.innerHTML || '')
    }
  }

  let new_note_and_tick = note_and_tick.value
  note_and_tick.value = []

  for (let ii = 0; ii < new_note_and_tick.length; ii++) {
    let newContent = ""
    let a = new_note_and_tick[ii].content
    let basic = new_note_and_tick[ii].type
    for (let i = 0; i < a.length; i++) {
      if (a.substring(i, i + sd.length) == sd) {
        if (newContent != '') {
          note_and_tick.value.push({type: basic, content: newContent, bz: new_note_and_tick[ii].bz})
        }
        newContent = ""
        note_and_tick.value.push({type: "high-light", content: sd, bz: ""})
        if (question != '') {
          note_and_tick.value.push({type: "tick", content: "问：" + question + "\n答：" + note, bz: sd})
        } else {
          note_and_tick.value.push({type: "tick", content: note, bz: sd})
        }
        i = i + sd.length - 1
      } else {
        newContent += a.charAt(i)
      }
    }
    if (newContent != '') {
      note_and_tick.value.push({type: basic, content: newContent, bz: new_note_and_tick[ii].bz})
    }
  }

  try {
    if (note_and_tick.value[note_and_tick.value.length - 1].type != 'content') {
      note_and_tick.value.push({type: "content", content: "", bz: ""})
    }
  } catch (e) {
    note_and_tick.value.push({type: "content", content: "", bz: ""})
  }
  console.log(note_tick.value)
  try {
    await pushNoteAiToServer(note_tick.value, text, note_ai_id.value)
  } catch (e) {
    console.error(e)
  }
}

async function pushNoteAiToServer(noteTick: note_ai[], note: string, noteAiId: string) {
  if (note!=""){
    const response = await axios.post(getAddress() + "/ai/note_sync", {
      id: getLocalData('id'),
      token: getLocalData("token"),
      note_ticks: noteTick,
      note_ai_id: noteAiId,
      note: note
    })
    console.log("note:" + note)
    if (response.data.response == 'success') {
      if (response.data.note_ai_id != null) {
        console.log(response.data.note_ai_id)
        note_ai_id.value = response.data.note_ai_id
      }
      try {
        await getNoteAiHistory()
      } catch (e) {
        console.error(e)
      }
      alr.value="保存成功"
      await delay(2000)
      alr.value=""
    } else {
      alr.value="服务器错误，可能无法同步您的笔记"
      await delay(2000)
      alr.value=""
    }
  }else{
    alr.value="不可以保存空内容"
    await delay(2000)
    alr.value=""
  }
}

async function getNoteAiHistory() {
  const response = await axios.post(getAddress() + "/ai/get_note_history", {
    id: getLocalData('id'),
    token: getLocalData("token"),
  })
  if (response.data.response == 'success') {
    ai_history.value = response.data.list
  } else if (response.data.response == 'token_check_failed') {
    alert("请重新登录")
  } else {
    alert("服务器错误")
  }
}

async function getHistoryNoteAi(noteAiId: string) {
  note_ai_id.value = noteAiId
  const response = await axios.post(getAddress() + "/ai/note_history", {
    id: getLocalData('id'),
    token: getLocalData('token'),
    note_ai_id: noteAiId
  })
  if (response.data.response == 'success') {
    note_tick.value = response.data.messages
    await loadNote(response.data.note)
  } else if (response.data.response == 'token_check_failed') {
    alert("历史笔记获取错误，TOKEN失效，请重新登录")
  } else {
    alert("服务器错误")
  }
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
  if (width < 680 || isApp()) {
    smallScreen.value = true;
  } else {
    smallScreen.value = false;
  }
}

function showAE(s: string): boolean {
  if (s == '') {
    return false
  } else if (s == ' ') {
    return false
  } else if (s == '\n') {
    return false
  }
  return true
}
</script>

<template>
  <div class="home_background" @keyup="all_text=getWholeText()">
    <transition name="right_choice">
      <note_ai_right_choice :list="ai_history" v-if="rightChoice" @rightClose="rightChoice = false" @newChat="newNoteAi"
                            @getHistoryAiMessages="getHistoryNoteAi"/>
    </transition>
    <note_ai_action_button :alr="alr" :small="smallScreen" :all_text="all_text" :note="true" @push_to_server="pushNoteAiToServer(note_tick,getWholeText(),note_ai_id)"/>
    <artificial_emoji :small="smallScreen" :all_text="getWholeText()" :selected="selectedText.replace(/ /g,' ')"
                      v-if="showAE(selectedText)"
                      @add_note="addNote" :note="true"/>
    <note_ai_title @rightChoice="rightChoice=true"/>
    <div v-if="!smallScreen" class="text_div_background" @keyup.stop="handleSelect" @mouseup.stop="handleSelect"
         @copy="handleSelect">
      <div class="text_div">
        <div v-for="(nat,i) of note_and_tick" style="display: inline">
          <div :id="i.toString()" @paste="pasteText(i)"
               style="display: inline;max-width: 100%;overflow-wrap: break-word;text-overflow: revert"
               v-if="nat.type=='content'" class="text" aria-placeholder="在此输入内容" contenteditable="true"
               v-html="escapeHTMLWithOutConsole(nat.content)">
          </div>
          <div :id="i.toString()"
               style='display: inline;overflow-wrap: break-word;background: #c8edff;outline: #1a98ee 1px solid;width: fit-content;max-width: 100%;color: #1a1a1a'
               v-else-if="nat.type=='high-light'" contenteditable="false"
               v-html="escapeHTMLWithOutConsole(nat.content)">
          </div>
          <div :id="i.toString()"
               style='overflow-wrap: break-word;background: linear-gradient(45deg,  #009bff, #29abff);;color: rgb(255,255,255);border-radius: 10px;padding: 10px;margin-bottom: 2px;max-width: calc(100% - 20px);width: fit-content'
               v-else-if="nat.type=='tick'" contenteditable="false">
            <div style="width: 100%;display: flex;justify-content: right">
              <img alt="delete" src="../../assets/close_white.svg" style="width: 20px;height: 20px;cursor: pointer"
                   @click="removeNote(nat.bz,nat.content)">
            </div>
            <div v-html="escapeHTML(nat.content)">

            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="smallScreen" class="text_div_background" @mouseup="handleSelect" @copy="handleSelect"
         @keyup.stop="handleSelect"
         @mouseup.stop="handleSelect">
      <div class="text_div_small">
        <div v-for="(nat,i) of note_and_tick" style="display: inline">
          <div :id="i.toString()" @paste="pasteText(i)"
               style="display: inline;max-width: 100%;overflow-wrap: break-word;text-overflow: revert"
               v-if="nat.type=='content'" class="text" aria-placeholder="在此输入内容" contenteditable="true"
               v-html="escapeHTMLWithOutConsole(nat.content)">
          </div>
          <div :id="i.toString()"
               style='display: inline;overflow-wrap: break-word;background: #c8edff;outline: #1a98ee 1px solid;width: fit-content;max-width: 100%;color: #1a1a1a'
               v-else-if="nat.type=='high-light'" contenteditable="false"
               v-html="escapeHTMLWithOutConsole(nat.content)">
          </div>
          <div :id="i.toString()"
               style='overflow-wrap: break-word;background: linear-gradient(45deg,  #009bff, #29abff);;color: rgb(255,255,255);border-radius: 10px;padding: 10px;margin-bottom: 2px;max-width: calc(100% - 20px);width: fit-content'
               v-else-if="nat.type=='tick'" contenteditable="false">
            <div style="width: 100%;display: flex;justify-content: right">
              <img alt="delete" src="../../assets/close_white.svg" style="width: 20px;height: 20px;cursor: pointer"
                   @click="removeNote(nat.bz,nat.content)">
            </div>
            <div v-html="escapeHTML(nat.content)">

            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.right_choice-enter-active,
.right_choice-leave-active {
  transition: opacity 0.25s ease;
}

.right_choice-enter-from,
.right_choice-leave-to {
  opacity: 0;
}

.home_background {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.text_div {
  background: #ffffff;
  min-height: 100vw;
  height: fit-content;
  min-width: calc(70vw - 80px);
  max-width: calc(70vw - 80px);
  margin: 20px;
  font-size: 16px;
  padding: 40px;
}

.text_div_small {
  background: #ffffff;
  min-height: calc(100vh - 214px);
  height: fit-content;
  font-size: 16px;
  min-width: calc(100vw - 40px);
  max-width: calc(100vw - 40px);
  padding: 20px 20px 140px;
}

.text_div_background {
  background-color: #f4f5f6;
  min-height: calc(100vh - 54px);
  max-height: calc(100vh - 54px);
  justify-content: center;
  overflow: auto;
  display: flex;
}

.text:empty::before {
  content: attr(aria-placeholder);
  color: #8a8a8a;
  cursor: text;
}

.text:not(:empty)::before {
  display: none;
}

.text:hover {
  border: none;
  outline: none;
}

.text:focus {
  border: none;
  outline: none;
}

.text {
  max-width: 100%;
  display: inline;
  overflow-wrap: break-word;
}
</style>