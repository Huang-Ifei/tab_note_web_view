<script setup>

import {delay, getLocalData, getTokenData, isApp} from "../../operation/dataOperation.ts";
import Note_ai_title from "./note_ai_title.vue";
import Artificial_emoji from "../ai_emoji/artificial_emoji.vue";
import {onBeforeUnmount, onMounted, ref, shallowRef} from "vue";
import axios from "axios";

import {getAddress} from "../../operation/address.ts";
import Note_ai_right_choice from "./note_ai_right_choice.vue";
import Note_ai_action_button from "./note_ai_action_button.vue";
import {Editor, Toolbar} from "@wangeditor/editor-for-vue";
import {Boot, DomEditor} from "@wangeditor/editor";

import {h} from 'snabbdom'

const note_ai_id = ref('')
const rightChoice = ref(false)
const ai_history = ref([])
const all_html = ref('')
const alr = ref('')
const tryDC = ref(false)
const text =ref("")

getNoteAiHistory()


//选择操作
const selection = ref()
const selectedText = ref("")

function getWholeText() {
  if (typeof editorRef.value !== "undefined") {
    return editorRef.value.getText()
  } else {
    return ""
  }
}

const handleSelect = () => {
  if (editorRef.value.selection !== null) {
    selectedText.value = window.getSelection().toString()
    selection.value = editorRef.value.selection
  } else {
    selectedText.value = ""
    selection.value = {}
  }
};

async function pushNoteAiToServer(noteTick, note, noteAiId) {
  const tk = await getTokenData()
  if (note !== "" && editorRef.value.getText() !== "") {
    const response = await axios.post(getAddress() + "/ai/note_sync", {
      id: getLocalData('id'),
      token: tk,
      note_ticks: noteTick,
      note_ai_id: noteAiId,
      note_content:getWholeText(),
      note: note
    })
    console.log("note:" + note)
    if (response.data.response === 'success') {
      if (response.data.note_ai_id !== null && response.data.note_ai_id !== undefined) {
        console.log(response.data.note_ai_id)
        note_ai_id.value = response.data.note_ai_id
      }
      try {
        await getNoteAiHistory()
      } catch (e) {
        console.error(e)
      }
      alr.value = "保存成功"
      await delay(2000)
      alr.value = ""
    } else {
      alr.value = "服务器错误，可能无法同步您的笔记"
      await delay(2000)
      alr.value = ""
    }
  } else {
    alr.value = "不可以保存空内容"
    await delay(2000)
    alr.value = ""
  }
}

async function getNoteAiHistory() {
  const tk = await getTokenData();
  const response = await axios.post(getAddress() + "/ai/get_note_history", {
    id: getLocalData('id'),
    token: tk,
  })
  if (response.data.response === 'success') {
    ai_history.value = response.data.list
  } else if (response.data.response === 'token_check_failed') {
    alert("请重新登录")
  } else {
    alert("服务器错误")
  }
}

async function getHistoryNoteAi(noteAiId) {
  note_ai_id.value = noteAiId
  const tk =  await getTokenData();
  const response = await axios.post(getAddress() + "/ai/note_history", {
    id: getLocalData('id'),
    token: tk,
    note_ai_id: noteAiId
  })
  if (response.data.response === 'success') {
    all_html.value = ""
    await delay(100)
    all_html.value = response.data.note
    while(true){
      await delay(500)
      if (editorRef.value.getHtml()!=='<p><br></p>')break
      else all_html.value = response.data.note
    }
    console.log("all:" + all_html.value)
  } else if (response.data.response === 'token_check_failed') {
    alert("历史笔记获取错误，TOKEN失效，请重新登录")
  } else {
    alert("服务器错误")
  }
}

onMounted(() => {
  renderResize();
  window.addEventListener("resize", renderResize, {once: true});
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

function showAE(s) {
  if (s === '') {
    return false
  } else if (s === ' ') {
    return false
  } else if (s === '\n') {
    return false
  }
  return true
}

function newChat() {
  note_ai_id.value = ""
  all_html.value = ""
}

const editorRef = shallowRef()

const toolbarConfig = {
  excludeKeys: [
    'group-video',
    'group-image',
    'italic',
    'fullScreen',
    'codeBlock'
  ]
}

const editorConfig = {placeholder: '请输入内容...', MENU_CONF: {}, scroll: false}


function ctPaste(editor, event) {
  const html = event.clipboardData.getData('text/html') // 获取粘贴的 html
  const text = event.clipboardData.getData('text/plain') // 获取粘贴的纯文本
  const rtf = event.clipboardData.getData('text/rtf') // 获取 rtf 数据（如从 word wsp 复制粘贴）

  // 同步
  editor.insertText(text)


  event.preventDefault()
  console.log()
  return false;
}

const mode = 'default'

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例
  //注册
  Boot.registerPlugin(withTick)
  Boot.registerRenderElem(renderElemConf)
  Boot.registerElemToHtml(elemToHtmlConf)
  Boot.registerParseElemHtml(parseHtmlConf)
}

const tick = {
  type: 'tick',
  question: "",
  answer: "",
  children: [{text: ""}]
}

async function addTick(sd, question, note) {

  editorRef.value.select(selection.value)
  editorRef.value.insertNode({text: sd, bgColor: "#96dfff"})
  editorRef.value.insertNode({
    type: 'tick', question: question, answer: note,
    children: [{text: ""}]
  })

  await delay(1000)
  await pushNoteAiToServer({}, all_html.value, note_ai_id.value)
}

//定义插件
function withTick(editor) {
  const {isInline, isVoid} = editor
  const newEditor = editorRef.value

  newEditor.isVoid = elem => {
    const type = DomEditor.getNodeType(elem)
    if (type === "tick") {
      return true
    }
    return isVoid(elem)
  }

  newEditor.isInline = elem => {
    const type = DomEditor.getNodeType(elem)
    if (type === 'tick') {
      return true
    }

    return isInline(elem)
  }

}

//定义render
function renderTick(elem, children, editor) {
  const {question = "", answer = ""} = elem
  let contentSpan;
  if (question === "") {
    contentSpan = h(
        'span',
        {
          props: {contentEditable: false},
          style: {
            display: 'inline-block',
            color: "white"
          }
        },
        [answer]
    )
  } else {
    contentSpan = h(
        'span',
        {
          props: {contentEditable: false},
          style: {
            display: 'inline-block',
            color: "white"
          }
        },
        ["问：", question, "\n答：", answer]
    )
  }

  return h(
      'div',
      {
        props: {contentEditable: false},
        style: {
          display: 'block',
          width: 'fit-content',
          height: 'fit-content',
          background: '#009bff',
          borderRadius: "5px",
          padding: "8px",
          color: "white"
        },
      },
      [contentSpan]
  );
}

//注册render
const renderElemConf = {
  type: "tick",
  renderElem: renderTick
}


//添加转换HTML
function tickToHTML(elem) {
  const {question = "", answer = ""} = elem
  let html;
  if (question === "") {
    html = `<div data-w-e-type="tick" data-w-e-is-inline data-w-e-is-void data-question="" data-answer="${answer}"></div>`
  } else {
    html = `<div data-w-e-type="tick" data-w-e-is-inline data-w-e-is-void data-question="${question}" data-answer="${answer}"></div>`
  }
  return html
}

//注册转换HTML
const elemToHtmlConf = {
  type: "tick",
  elemToHtml: tickToHTML
}


//解析tick HTML进编辑器
function parseTick(domELem, children, editor) {
  const question = domELem.getAttribute("data-question") || ""
  const answer = domELem.getAttribute("data-answer") || ""
  const newTick = {
    type: "tick",
    question: question,
    answer: answer,
    children: [{text: ""}]
  }
  return newTick
}

//注册解析
const parseHtmlConf = {
  selector: "div[data-w-e-type='tick']",
  parseElemHtml: parseTick
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

</script>

<template>
  <div class="home_background">
    <transition name="right_choice">
      <note_ai_right_choice :list="ai_history" v-if="rightChoice" @rightClose="rightChoice = false" @newChat="newChat"
                            :note_ai_id="note_ai_id" @getHistoryAiMessages="getHistoryNoteAi"/>
    </transition>
    <note_ai_action_button :alr="alr" :small="smallScreen" :all_text="text" @click="text=getWholeText()" :note="true"
                           @push_to_server="pushNoteAiToServer({},all_html,note_ai_id)" :tryDC="tryDC"/>
    <artificial_emoji :small="smallScreen" :all_text="getWholeText()" :selected="selectedText.replace(/ /g,' ')"
                      v-if="showAE(selectedText)" :tryDC="tryDC"
                      @add_note="addTick" :note="true" @stop-select="selectedText=''"/>
    <note_ai_title :small="smallScreen" @rightChoice="rightChoice=true" @tryDC="tryDC=!tryDC"/>

    <Toolbar
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
        v-if="!smallScreen"
    />
    <div v-if="!smallScreen" class="text_div_background" @keyup.stop="handleSelect"
         @mouseup.stop="handleSelect();console.log(editorRef.selection)"
         @touchend.stop="handleSelect()"
         @copy="handleSelect">
      <div class="text_div">
        <Editor
            style="height: 100%"
            v-model="all_html"
            :defaultConfig="editorConfig"
            @customPaste="ctPaste"
            :mode="mode"
            @onCreated="handleCreated"
        />
      </div>
    </div>
    <Toolbar
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
        v-if="smallScreen"
    />
    <div v-if="smallScreen" class="text_div_background"
         @keyup.stop="handleSelect"
         @touchend.stop="handleSelect"
         @mouseup.stop="handleSelect">
      <div class="text_div_small">
        <Editor
            style="height: 100%"
            v-model="all_html"
            :defaultConfig="editorConfig"
            @customPaste="ctPaste"
            :mode="mode"
            @onCreated="handleCreated"
        />
      </div>
    </div>


  </div>
</template>

<style>

.w-e-text-container [data-slate-editor] p {
  margin: 2px 0
}

.w-e-text-placeholder {
  font-style: italic;
  left: 10px;
  top: 2px;
  width: 90%
}

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

.text_div_background {
  background-color: #f4f5f6;
  width: 100%;
  height: 100%;
  justify-content: center;
  overflow: auto;
  display: flex;
}

.text_div {
  background: #ffffff;
  min-height: 100vw;
  height: fit-content;
  min-width: calc(70% - 50px);
  max-width: calc(70% - 50px);
  margin: 15px;
  font-size: 16px;
  padding: 30px;
}

.text_div_small {
  background: #ffffff;
  min-height: calc(100vh - 214px);
  height: fit-content;
  font-size: 16px;
  min-width: calc(100% - 40px);
  max-width: calc(100% - 40px);
  padding: 20px 20px 140px;
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