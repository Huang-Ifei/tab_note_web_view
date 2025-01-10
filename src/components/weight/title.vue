<script setup lang="ts">
import {ref} from "vue";
import {delay, getAccountImg, getLocalData, isApp} from "../../operation/dataOperation.ts";
import router from "../../router";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";


const imageURL = ref("")
const props = defineProps(['smallScreen', 'todo'])
const h = ref('54px')
const emit = defineEmits(['todoView', 'leftChoice'])
imageURL.value = getAccountImg()

const vm = defineModel()

console.log(sessionStorage.getItem("dont_main_view"))

if (sessionStorage.getItem("dont_main_view") == null || sessionStorage.getItem("dont_main_view") == "false") {
  startMainView()
}
async function startMainView(){
  h.value = '100%'
  await delay(1)
  opc.value = 1
  vm.value = true
}

async function closeMainView() {
  vm.value = false
  sessionStorage.setItem("dont_main_view", "true")
  opc.value = 0
  h.value = '54px'
  choice = 0
}

async function openMainView() {
  h.value = '100%'
  sessionStorage.setItem("dont_main_view", "false")
  opc.value = 1
  vm.value = true
}

const wHeight = ref(window.innerHeight)
const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)
const trans = ref("height 0.3s ease")
const opc = ref(1)

// 处理触摸开始事件
function handleTouchStart(event: TouchEvent) {
  isDragging.value = true;
  trans.value = "height 0.05s ease"
  startY.value = event.touches[0].clientY;
}

// 处理触摸移动事件
function handleTouchMove(event: TouchEvent) {
  if (isDragging.value) {
    event.preventDefault();
    currentY.value = event.touches[0].clientY;
    const deltaY = startY.value - currentY.value;
    let a = -deltaY + 54;
    if (a > 54) {
      h.value = a + 'px';
    } else {
      h.value = '54px';
    }
  }
}

async function handleTouchEnd() {
  isDragging.value = false;
  trans.value = "height 0.3s ease"
  if (startY.value - currentY.value < 0) {
    await openMainView();
  } else {
    await closeMainView()
  }
}

function handleCloseTouchStart(event: TouchEvent) {
  isDragging.value = true;
  trans.value = "height 0.05s ease"
  startY.value = event.touches[0].clientY;
}


function handleCloseTouchMove(event: TouchEvent) {
  if (isDragging.value) {
    event.preventDefault();
    currentY.value = event.touches[0].clientY;
    const deltaY = startY.value - currentY.value;
    opc.value = (wHeight.value - deltaY) / wHeight.value;
  }
}

async function handleCloseTouchEnd() {
  isDragging.value = false;
  trans.value = "height 0.3s ease"
  if (startY.value - currentY.value < 50) {
    await openMainView();
  } else {
    await closeMainView()
  }
}

const scrollContainer = ref<HTMLDivElement | null>(null);
const max_value = 3
let choice = 0
let startX = 0
let currentX = 0
let drag = false

function handleScrollStart(event: TouchEvent) {
  event.preventDefault();
  startX = event.touches[0].clientX;
}

//监听滚动
function handleScroll(event: TouchEvent) {
  drag = true
  currentX = event.touches[0].clientX;
}

async function handleScrollEnd() {
  if (drag) {
    if (startX > (currentX + 30)) {
      if (choice < max_value - 1) {
        console.log(choice + 1)
        choice = choice + 1
      }
    } else if (startX < (currentX - 30)) {
      if (choice > 0) {
        choice = choice - 1
      }
    }

    if (scrollContainer.value == null) return
    const wWidth = window.innerWidth;
    scrollContainer.value.scrollTo({
      left: choice * (wWidth - 60),
      behavior: "smooth"
    });
    drag = false
  } else {
    switch (choice) {
      case 0 :
        await router.push('ai_assistant');
        break;
      case 1 :
        await router.push('beat_question');
        break;
      case 2 :
        await router.push('note_ai');
        break;
    }
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
  <div class="title_background" :style="{height:h,transition:trans}">

  </div>
  <transition>
    <div @touchstart.stop="handleCloseTouchStart" @touchmove.stop="handleCloseTouchMove"
         @touchend.stop="handleCloseTouchEnd"
         class="title_main" v-if="vm" @click.stop="closeMainView">
      <div :style="{opacity:opc}" style="display: flex;flex-direction: row; align-items: flex-end;">
        <p style="margin: 30px 10px 5px 40px;font-size: 1.5rem;font-weight: bold">
          TabNote_
        </p>
        <div style="width: 100%;height: 3rem;display: flex;flex-direction: row; align-items:center;justify-content:flex-end">
          <img v-if="rank==2" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA.svg" style="width: 5rem;margin-right: 0.4rem;margin-top: 0.9rem"/>
          <img v-if="rank==4" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA+.svg" style="width: 5rem;margin-right: 0.4rem;margin-top: 0.9rem"/>
          <img v-if="rank==6" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA++.svg" style="width: 5rem;margin-right: 0.4rem;margin-top: 0.9rem"/>
          <img v-if="!isApp()" @touchstart.stop @touchmove.stop @touchend.stop @click.stop="router.push('login')"
               style="height: 3rem;width: 3rem;border-radius: 3rem;margin-right: 40px" :src="imageURL" alt="image"/>
        </div>
      </div>
      <div
          style="display: flex;flex-direction: row;align-items:flex-end;width: 100%;height: 100%;margin-bottom: 2vh;overflow-y: auto;">
        <div :style="{opacity:opc}" v-if="!smallScreen"
             style="overflow: auto;display: flex;flex-direction: row;color: #434343">
          <div style="width: 30px;min-width: 30px">

          </div>
          <div @touchstart.stop @touchmove.stop @touchend.stop @click.stop="router.push('ai_assistant')"
               class="others_action">
            <img alt="AI chat" style="height: 100%;width: auto;border-radius: 15px" src="../../assets/post/ai.png"/>
            <p style="color: white;position: absolute;font-size: 1.7rem;font-weight: bold;margin-top: 20px;margin-left: 8%">
              AI对话
            </p>
            <p style="color: white;position: absolute;font-size: 1.1rem;margin-top: calc(1.8rem + 35px);margin-left: 8%">
              超超超超超智慧！<br>
              超超超超超快速！
            </p>
          </div>
          <div @touchstart.stop @touchmove.stop @touchend.stop @click.stop="router.push('beat_question')"
               style="margin-left: 20px" class="others_action">
            <img alt="AI VISION" style="height: 100%;width: auto;border-radius: 15px"
                 src="../../assets/post/ai_vision.png"/>
            <p style="color: white;position: absolute;font-size: 1.7rem;font-weight: bold;margin-top: 20px;margin-left: 8%">
              AI识题
            </p>
            <p style="color: white;position: absolute;font-size: 1.1rem;margin-top: calc(1.8rem + 35px);margin-left: 8%">
              遇到难题？<br>
              两位“学霸”在线解答！
            </p>
          </div>
          <div @touchstart.stop @touchmove.stop @touchend.stop @click.stop="router.push('note_ai')"
               class="others_action">
            <img alt="AI Note" style="height: 100%;width: auto;border-radius: 15px"
                 src="../../assets/post/ai_note.png"/>
            <p style="color: white;position: absolute;font-size: 1.7rem;font-weight: bold;margin-top: 20px;margin-left: 8%">
              AI笔记
            </p>
            <p style="color: white;position: absolute;font-size: 1.1rem;margin-top: calc(1.8rem + 35px);margin-left: 8%">
              随笔记，随手问<br>
              快问快答，高效速记！
            </p>
          </div>
          <div style="min-width: 30px;max-width: 30px;width: 30px">
            &nbsp;&nbsp;&nbsp;
          </div>
        </div>
        <div :style="{opacity:opc}" v-if="smallScreen" @touchend.stop="handleScrollEnd"
             @touchstart.stop="handleScrollStart" @touchmove.stop="handleScroll"
             ref="scrollContainer"
             style="overflow-x: hidden;display: flex;flex-direction: row;color: #434343">
          <div style="width: 30px;min-width: 30px">

          </div>
          <div @click.stop="router.push('ai_assistant')"
               class="others_action" style="min-width: calc(100vw - 80px)">
            <img alt="AI chat" style="height: auto;width: 100%;border-radius: 15px" src="../../assets/post/ai.png"/>
            <p style="color: white;position: absolute;font-size: 1.7rem;font-weight: bold;margin-top: 20px;margin-left: 8%">
              AI对话
            </p>
            <p style="color: white;position: absolute;font-size: 1.1rem;margin-top: calc(1.8rem + 35px);margin-left: 8%">
              超超超超超智慧！<br>
              超超超超超快速！
            </p>
          </div>
          <div @click.stop="router.push('beat_question')"
               style="min-width: calc(100vw - 80px)" class="others_action">
            <img alt="AI VISION" style="height: 100%;width: auto;border-radius: 15px"
                 src="../../assets/post/ai_vision.png"/>
            <p style="color: white;position: absolute;font-size: 1.7rem;font-weight: bold;margin-top: 20px;margin-left: 8%">
              AI识题
            </p>
            <p style="color: white;position: absolute;font-size: 1.1rem;margin-top: calc(1.8rem + 35px);margin-left: 8%">
              遇到难题？<br>
              两位“学霸”在线解答！
            </p>
          </div>
          <div @click.stop="router.push('note_ai')" class="others_action"
               style="min-width: calc(100vw - 80px);">
            <img alt="AI Note" style="height: 100%;width: auto;border-radius: 15px"
                 src="../../assets/post/ai_note.png"/>
            <p style="color: white;position: absolute;font-size: 1.7rem;font-weight: bold;margin-top: 20px;margin-left: 8%">
              AI笔记
            </p>
            <p style="color: white;position: absolute;font-size: 1.1rem;margin-top: calc(1.8rem + 35px);margin-left: 8%">
              随笔记，随手问<br>
              快问快答，高效速记！
            </p>
          </div>
          <div style="min-width: 30px;max-width: 30px;width: 30px">
            &nbsp;&nbsp;&nbsp;
          </div>
        </div>
      </div>
      <div style="width: 100%;text-align: center;color: #6c6c6d;font-size:12px;margin-bottom: 2vh">
        向上滑动或轻点空白处进入主页
      </div>
    </div>
  </transition>
  <transition>
    <div @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" class="title"
         v-if="!props.smallScreen&&!vm">
      <h3 @click="openMainView" style="cursor:pointer;margin: 0;padding-left: 20px">
        TabNote_
      </h3>
      <div class="icons">
        <button @touchstart.stop @touchmove.stop @touchend.stop class="none_button"
                onclick="location.href='/add_tab_note'">
          新建贴文
        </button>
        <button @touchstart.stop @touchmove.stop @touchend.stop class="none_button"
                @click="emit('todoView',!props.todo)">
          计划/待办
        </button>
        <button @touchstart.stop @touchmove.stop @touchend.stop class="none_button"
                onclick="location.href='/beat_question'">
          &nbsp;AI识题&nbsp;
        </button>
        <button @touchstart.stop @touchmove.stop @touchend.stop class="none_button" onclick="location.href='/note_ai'">
          &nbsp;AI笔记&nbsp;
        </button>
        <button @touchstart.stop @touchmove.stop @touchend.stop id="ai_button" onclick="location.href='/ai_assistant'">
          AI助手
        </button>
        <img @touchstart.stop @touchmove.stop @touchend.stop @click="router.push('login')" id="usrImage" :src="imageURL"
             alt="image"/>
      </div>
    </div>
  </transition>
  <transition>
    <div @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" class="small_title"
         v-if="props.smallScreen&&!vm">
      <img @touchstart.stop @touchmove.stop @touchend.stop @click="emit('leftChoice')" src="../../assets/menu_gray.svg"
           alt="image"
           style="padding-left: 10px;padding-right: 10px;height: 25px"/>
      <h3 @click="openMainView" style="cursor:pointer;margin: 0">
        TabNote_
      </h3>
      <div class="icons">
        <button @touchstart.stop @touchmove.stop @touchend.stop id="ai_button" style="font-size: 15px"
                onclick="location.href='/ai_assistant'">
          AI助手
        </button>
        <img @touchstart.stop @touchmove.stop @touchend.stop v-if="!isApp()" @click="router.push('login')" id="usrImage"
             :src="imageURL" alt="image"/>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.v-enter-active {
  transition: opacity 0.25s ease 0.2s;
}
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.others_action {
  width: 26vw;
  height: auto;
  position: relative;
  min-width: 250px;
  border-radius: 15px;
  margin: 10px 10px 10px 10px;
  background: #f3f3f5;
  display: flex;
  flex-direction: column;
  color: #1a1a1a;
  cursor: pointer;
}

.others_action:focus,
.others_action:hover {
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.small_title {
  transition: height 0.3s ease;
  background-color: transparent;
  height: 54px;
  position: absolute;
  width: calc(100% - 30px);
  z-index: 501;
  padding: 0 20px 0 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.title_background {
  background-color: rgba(253, 253, 254, 0.8);
  backdrop-filter: blur(10px);
  transition: height 0.3s ease;
  z-index: 500;
  width: 100%;
  position: absolute;
}

.title_main {
  z-index: 502;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  position: absolute;
}

.title {
  position: absolute;
  background-color: transparent;
  z-index: 501;
  height: 54px;
  width: calc(100% - 30px);
  padding: 0 20px 0 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.icons {
  left: auto;
  position: marker;
  width: 100%;
  display: flex;
  justify-content: right;
}

.none_button {
  border-radius: 0;
  font-size: 13px;
  background: transparent;
  height: 54px;
  margin-top: 3px;
  box-shadow: none;
  color: rgba(0, 0, 0, 0.8);
  border: none;
}

.none_button:hover {
  outline: 0;
  border: none;
  text-shadow: 0 0 8px #eaeaea;
}

.none_button:focus {
  outline: 0;
  border: none;
  text-shadow: 0 0 8px #eaeaea;
}

#ai_button {
  font-size: 13px;
  color: rgb(255, 255, 255);
  background: #0d94f7;
  padding: 8px 20px;
  margin: 10px 10px 10px 5px;
  box-shadow: none;
  border: none;
}

#ai_button:hover {
  box-shadow: 0 0 8px #eaeaea;
  border: none;
}

#usrImage {
  cursor: pointer;
  outline: 2px solid white;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 50%;
}

#usrImage:hover {
  box-shadow: 0 0 12px #c6e9ff;
}
</style>