<script setup lang="ts">

import Compressor from "compressorjs";
import {onBeforeUnmount, onMounted, onUnmounted, Ref, ref} from "vue";
import axios from "axios";
import {addressOperation, getAddress, getWholeAddress} from "../../operation/address.ts";
import {delay, deleteAccount, escapeHTML, getLocalData, getTokenData} from "../../operation/dataOperation.ts";
import Bq_title from "./bq_title.vue";
import router from "../../router";
import Loading from "../weight/loading.vue";


const model = ref("AM")

type dxstjJson = {
  text: string,
  question: string,
  answer: string,
}
const imageSrc = ref("")
const isLoading = ref(false);
const dxstj: Ref<dxstjJson[]> = ref([{text: "", question: "", answer: ""}])
const text = ref("")
const dxstj_choice = ref(0)
const imgName = ref("")
const imgNameHigh = ref("")
const aiAnswer = ref("")
const allValue = ref("")
const thinking = ref("")

function initView() {
  aiAnswer.value = ""
  allValue.value = ""
  thinking.value = ""
  text.value = ""
  dxstj_choice.value = 0
  dxstj.value = [{text: "", question: "", answer: ""}]
}

async function handleFileChange(event: Event) {
  initView();
  //事件的目标作为HTML输入组件
  const target = event.target as HTMLInputElement;
  //输入组件的第0个文件
  const file: File | null = (target.files && target.files[0]) || null;

  if (file) {
    try {
      //压缩文件
      new Compressor(file, {
        quality: 0.75,
        maxWidth: 1500,
        maxHeight: 1500,
        convertSize: 150000,
        mimeType: 'image/jpeg',
        success(result) {//成功执行：reader读取内容到imageSrc中（base64编码）
          const reader = new FileReader();
          reader.onload = async () => {
            const base64String = reader.result as string;
            imageSrc.value = base64String;
            console.log(base64String);
            imgNameHigh.value = await insertTabNoteImg(base64String);

            imgName.value = imgNameHigh.value+"_LQ"
            if (imgNameHigh.value !== "" && imgName.value !== "") {
              //开始获取大学搜题酱信息
              await getDXSTJ()
            }
          };
          reader.readAsDataURL(result instanceof Blob ? result : new Blob([result]));
        },
        error(error) {
          console.error('Compression error:', error.message);
        },
      });
    } catch (e) {
      console.error(e)
    }
  } else {
    // 如果没有选择文件，重置图片 URL
    imageSrc.value = "";
  }
}

function clickInputImg() {
  document?.getElementById('add_new')?.click()
}


// async function getDXSTJ() {
//   aiAnswer.value = ""
//   allValue.value = ""
//   thinking.value = ""
//   text.value = ""
//   dxstj_choice.value = 0
//   dxstj.value = [{text: "", question: "", answer: ""}]
//   try {
//     const axiosResponse = await axios.post(getAddress() + "/ai/dxstj", {
//       id: getLocalData('id'),
//       token: await getTokenData(),
//       img: imageSrc.value
//     })
//     console.log(axiosResponse.data)
//     if (axiosResponse.data.response === 'success' && !axiosResponse.data.questionList[0].answer.includes('当前登录已经失效') ) {
//       text.value = axiosResponse.data.text
//       console.log(text.value)
//       text.value = text.value.replace(/-\|\|\|-/g, "\n");
//       console.log(text.value)
//       dxstj.value = axiosResponse.data.questionList
//       await post(model.value, dxstj.value)
//     } else if (axiosResponse.data.questionList[0].answer.includes('当前登录已经失效')) {
//       dxstj.value = [{
//         text: "",
//         question: "<p style='padding: 10px'>大学搜题酱已变更验证信息，我们正在努力抢修中，暂时停止提供大学搜题酱答案</p>",
//         answer: ""
//       }]
//       await post(model.value, [{text: "", question: "<p style='padding: 10px'>大学搜题酱已变更验证信息，我们正在努力抢修中，暂时停止提供大学搜题酱答案</p>", answer: ""}])
//     } else {
//       dxstj.value = [{text: "", question: "<p style='padding: 10px'>大学搜题酱搜索失败</p>", answer: ""}]
//       await post(model.value, [{text: "", question: "<p style='padding: 10px'>大学搜题酱搜索失败</p>", answer: ""}])
//     }
//     //刷新历史记录
//     historyBQ.value = []
//     await getBQList()
//   } catch (e) {
//     console.error(e)
//   }
// }

async function getDXSTJ() {
  try {
    await post(model.value, [{text: "", question: "", answer: ""}])
    // //刷新历史记录
    historyBQ.value = []
    await getBQList()
  } catch (e) {
    console.error(e)
  }
}


async function insertTabNoteImg(s: string): Promise<string> {
  console.log({img: s})
  const axiosResponse = await axios.post(getAddress() + "/insertTabNoteImg", {img: s})
  if (axiosResponse.data !== "failed" && axiosResponse.data !== "" && axiosResponse.data !== "undefined") {
    let img = axiosResponse.data
    console.log(img)
    return axiosResponse.data
  } else {
    console.log("failed")
    alert("图片上传出错")
    return ""
  }
}


//发送信息并获取内容流式传输
async function post(model: string, dxstjJsonArray: dxstjJson[]) {
  isLoading.value = true
  try {
    const tk = await getTokenData()
    // 发起 POST 请求
    const response = await fetch(
        getAddress() + "/ai/bq",
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json;charset=utf-8'},
          body: JSON.stringify({
            img: getWholeAddress() + "/tabNoteImg?name=" + imgName.value,
            imgHigh: getWholeAddress() + "/tabNoteImg?name=" + imgNameHigh.value,
            model: model,
            id: getLocalData('id'),
            token: tk,
            text: text.value,
            dxstjJsonArray: dxstjJsonArray
          }),
        }
    );

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
              console.log(i + ":" + "{" + errDecodeValue[i] + "}");
              decodeJsonToShow("{" + errDecodeValue[i] + "}", allValue)
            } else if (i == errDecodeValue.length - 1) {
              console.log(i + ":" + "{" + errDecodeValue[i]);
              decodeJsonToShow("{" + errDecodeValue[i], allValue)
            }
          }
        } else {
          decodeJsonToShow(decodeValue, allValue)
        }
      }
      isLoading.value = false
      await delay(500)
      aiAnswer.value = allValue.value;
    }
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    // 请求失败，处理错误
    console.error('Error fetching data:', error);
  }
}

function decodeJsonToShow(decodeValue: string, allValue: Ref<string>) {
  //如果是末尾条，添加返回的ai表id：
  if (decodeValue.startsWith('{"response":"')) {
    console.log(JSON.parse(decodeValue).response)
    try {
      aiAnswer.value = allValue.value;
    } catch (e) {
      console.error("done but:" + e)
    }
  } else {
    try {
      if (JSON.parse(decodeValue).message.content) {
        aiAnswer.value += JSON.parse(decodeValue).message.content;
        allValue.value += JSON.parse(decodeValue).message.content;
      }
      if (JSON.parse(decodeValue).message.reasoning_content) {
        thinking.value += JSON.parse(decodeValue).message.reasoning_content
      }
    } catch (e) {
      console.error("get mess but:" + e)
    }
  }
}

const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)
const bqHistoryHeight = ref(15)

// 处理触摸开始事件
function handleTouchStart(event: TouchEvent) {
  isDragging.value = true;
  startY.value = event.touches[0].clientY;
}

// 处理触摸移动事件
function handleTouchMove(event: TouchEvent) {
  if (isDragging.value) {
    event.preventDefault();
    currentY.value = event.touches[0].clientY;
    const deltaY = startY.value - currentY.value;
    const newHeight = Math.min(Math.max(bqHistoryHeight.value + deltaY / window.innerHeight * 100, 15), 100);
    bqHistoryHeight.value = newHeight; // 更新高度
    if (startY.value > currentY.value) {
      bqHistoryHeight.value = 100; // 如果之前大于之后，完全展开
    } else {
      bqHistoryHeight.value = 15;
    }
  }
}

function handleTouchEnd() {
  isDragging.value = false;
  if (bqHistoryHeight.value > 75) {
    bqHistoryHeight.value = 100; // 如果高度超过 75%，完全展开
  } else {
    bqHistoryHeight.value = 15; // 如果高度小于等于 75%，回到初始高度
  }
}

onMounted(() => {
  const bqHistoryElement = document.getElementById('bq_history');
  bqHistoryElement?.addEventListener('touchstart', handleTouchStart);
  bqHistoryElement?.addEventListener('touchmove', handleTouchMove);
  bqHistoryElement?.addEventListener('touchend', handleTouchEnd);
});

onUnmounted(() => {
  const bqHistoryElement = document.getElementById('bq_history');
  bqHistoryElement?.removeEventListener('touchstart', handleTouchStart);
  bqHistoryElement?.removeEventListener('touchmove', handleTouchMove);
  bqHistoryElement?.removeEventListener('touchend', handleTouchEnd);
});


//同步历史记录
// async function insertBQ() {
//   const tk = await getTokenData()
//   const axiosResponse = await axios.post(getAddress() + "/ai/insertBQ", {
//     usr_id: getLocalData("id"),
//     token: tk,
//     text: text.value,
//     ai_answer: aiAnswer.value,
//     dxstj: dxstj.value,
//     img: getWholeAddress() + "/tabNoteImg?name=" + imgName.value
//   })
//   if (axiosResponse.data.response == "success") {
//     console.log("上传历史记录成功")
//
//   } else {
//     alert("上传历史记录失败")
//   }
// }

//历史
type BQForList = {
  bq_id: string,
  date_time: string,
  img: string
}

const historyBQ: Ref<BQForList[]> = ref([])

//获取历史记录
async function getBQList() {
  const tk = await getTokenData()
  const axiosResponse = await axios.post(getAddress() + "/ai/BQList", {
    id: getLocalData("id"),
    token: tk,
    index: historyBQ.value.length
  })
  if (axiosResponse.data.response == "success") {
    console.log(axiosResponse.data.list)
    for (let i = 0; i < axiosResponse.data.list.length; i++) {
      historyBQ.value.push(axiosResponse.data.list[i])
    }
  } else if (axiosResponse.data.response == "token_check_failed") {
    alert("登录令牌失效，请重新登录")
    await deleteAccount()
    await router.push("login")
  } else {
    alert("历史记录获取失败")
  }
}

//默认
getBQList()

//获取某条历史内容
async function getBQ(s: string, pic: string) {
  initView();
  imageSrc.value = addressOperation(pic)
  isLoading.value = true
  const tk = await getTokenData()
  const axiosResponse = await axios.post(getAddress() + "/ai/BQ", {
    id: getLocalData("id"),
    token: tk,
    bq_id: s
  })
  if (axiosResponse.data.response == "success") {
    dxstj_choice.value = 0
    imageSrc.value = addressOperation(axiosResponse.data.img)
    aiAnswer.value = axiosResponse.data.ai_answer
    text.value = axiosResponse.data.text
    dxstj.value = axiosResponse.data.dxstj
  } else if (axiosResponse.data.response == "token_check_failed") {
    alert("登录令牌失效，请重新登录")
  } else {
    alert("历史记录获取失败")
  }
  isLoading.value = false
}

getRank()

const rank = ref(0)

async function getRank() {
  const response = await axios.get(getAddress() + "/vip/rank?id=" + getLocalData("id"))
  rank.value = response.data.rank
  if (response.data.rank <= 0) {
    await router.push("afa")
  }
  if (response.data.rank > 3) {
    model.value = "AAM"
  }
}

function choiceO1Mini() {
  if (rank.value > 3) {
    alert("o1-mini GPT工作流现在正在内测阶段，可能会出现错误，请谨慎使用")
    model.value = 'o1-mini'
  } else {
    model.value = 'AM'
  }
}

let scrollTime = 0

// 检测是否到达底部并加载数据
async function handleScroll() {
  const scrollTop = document.getElementById("bq_history_items")?.scrollTop
  const clientHeight = document.getElementById("bq_history_items")?.clientHeight
  const maxHeight = document.getElementById("bq_history_items")?.scrollHeight
  if (typeof scrollTop == 'undefined' || typeof clientHeight == 'undefined' || typeof maxHeight == 'undefined') {
    return
  }
  if ((scrollTop + clientHeight > maxHeight - 10) && (scrollTime + 200 < Date.now())) {
    scrollTime = Date.now()
    await getBQList()
  }
}

onMounted(() => {
  document.getElementById("bq_history_items")?.addEventListener("scroll", handleScroll);
})

onBeforeUnmount(() => {
  document.getElementById("bq_history_items")?.removeEventListener("scroll", handleScroll);
})

</script>

<template>
  <Bq_title/>
  <!--拍照界面-->
  <div class="shot_view">
    <div v-if="imageSrc==''">
      <img alt="" @click="model='gpt-4o'" v-if="model==='AAM'" style="width: 130px;margin-bottom: 5px"
           src="../../assets/vip/AAM.svg">
      <img alt="" @click="model='gpt-4o'" v-if="model==='AM'" style="width: 130px;margin-bottom: 5px"
           src="../../assets/vip/AM.svg">
      <img alt="" @click="choiceO1Mini()" v-if="model==='gpt-4o'" style="width: 130px;margin-bottom: 5px"
           src="../../assets/vip/GPT4o.svg">
      <img alt="" @click="model='AAM'" v-if="model==='o1-mini'" style="width: 130px;margin-bottom: 5px"
           src="../../assets/vip/o1miniGPT.svg">
    </div>
    <button v-if="imageSrc==''" id="add" @click="clickInputImg">
      <input id="add_new" type="file" accept="image/*" @change="handleFileChange($event)"/>
      <img alt="相机" style="width: 70px;height: 70px" src="../../assets/camera.svg"/>
    </button>
    <div class="bq_history_background">
      <div id="bq_history" class="bq_history" :style="{height:'calc('+bqHistoryHeight+'% - 10px)'}">
        <img v-if="bqHistoryHeight>75" @click="bqHistoryHeight=20" src="../../assets/down.svg"
             style="width: 100%;height: 20px">
        <img v-if="bqHistoryHeight<75" @click="bqHistoryHeight=100" src="../../assets/up.svg"
             style="width: 100%;height: 20px">
        <h3 style="margin: 0 10px;padding: 0;font-size: 18px">
          历史记录
        </h3>
        <div id="bq_history_items" style="overflow: auto;max-height: calc(100% - 48px)" @touchstart.stop>
          <div style="min-height: 10px"></div>
          <div v-for="(bq,ii) in historyBQ" :key="ii" @click="getBQ(bq.bq_id,bq.img)" class="bq_history_item">
            <img :src="addressOperation(bq.img)"
                 style="width: 100%;height: 20vh;border-radius: 8px; object-fit: cover;">
            <p>{{ bq.date_time }}</p>
          </div>
          <div style="min-height: 20px"></div>
        </div>
      </div>
    </div>
  </div>
  <!--查询界面-->
  <transition>
    <div v-if="imageSrc!=''" class="search_view">
      <div style="min-height: 54px">

      </div>
      <img alt="背景的图片"
           style="max-width: calc(100vw - 20px);max-height: 60vh;padding: 0;top:64px;position: absolute;filter: blur(20px)"
           :src="imageSrc"/>
      <img alt="上传的图片"
           style="max-width: calc(100vw - 20px);max-height: 60vh;padding: 0;margin-top:10px;position: sticky;border-radius: 8px;z-index: 11"
           :src="imageSrc"/>
      <div class="show_items" style="margin-top: 10px">
        <div class="action_choice">
          AI识题
        </div>
        <loading v-if="isLoading" style="padding: 10px"/>
        <div v-if="thinking!=''" style="color: #8d8d8d;font-size: 12px;margin-bottom: 0;padding: 20px 20px 0;"
             v-html="escapeHTML(thinking)">

        </div>
        <div v-html="escapeHTML(aiAnswer)" class="content">

        </div>
      </div>
      <div style="min-height: 10px">
      </div>
      <!--      <div class="show_items">-->
      <!--        <div class="action_choice">-->
      <!--          大学搜题酱-->
      <!--        </div>-->
      <!--        <div style="overflow: auto;display: flex;flex-direction: row">-->
      <!--          <div v-for="(json,ii) in dxstj" :key="ii" class="action_choice"-->
      <!--               style="padding:8px 14px;font-size: 12px;background: white"-->
      <!--               @click="dxstj_choice=ii;console.log(dxstj_choice)">-->
      <!--            <input type="hidden" :value="json">-->
      <!--            <p v-if="ii==dxstj_choice" style="color: #1a98ee;">{{ ii + 1 }}</p>-->
      <!--            <p v-else style="color: #1c1c1c;">{{ ii + 1 }}</p>-->
      <!--          </div>-->
      <!--        </div>-->

      <!--        <div class="answer_items">-->
      <!--          <p style="font-weight: bold;font-size: 17px">题目：</p>-->
      <!--          <div v-html="dxstj[dxstj_choice].question">-->

      <!--          </div>-->
      <!--          <p style="font-weight: bold;margin-top: 5px;font-size: 17px">答案：</p>-->
      <!--          <div v-html="dxstj[dxstj_choice].answer">-->

      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
      <div style="min-height: 54px">
      </div>
    </div>
  </transition>
  <!--关闭按钮-->
  <div @click="imageSrc='';getBQList()" v-if="imageSrc!=''" class="close">
    <img alt="关闭" style="width: 32px;height: 32px;padding: 4px" src="../../assets/close.svg"/>
  </div>
</template>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

#mosaic-image {
  height: auto; /* 让高度自动调整以保持宽高比 */
  max-width: 100%; /* 确保图片不会超过容器的宽度 */
}

img {
  max-width: 100%;
  height: auto; /* 让高度自动调整以保持宽高比 */
}
</style>

<style scoped>
.bq_history_item {
  width: calc(100% - 40px);
  height: fit-content;
  box-shadow: rgba(149, 157, 165, 0.2) 0 0 12px;
  padding: 10px;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
}

.search_view {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  background: white;
}

.bq_history {
  min-height: 50px;
  pointer-events: visible;
  overflow: hidden;
  background: rgb(243, 243, 243, 0.8);
  backdrop-filter: blur(20px);
  padding: 10px 10px 0 10px;
  border-radius: 25px 25px 0 0;
  position: absolute;
  transition: height 0.3s ease;
  width: calc(100% - 20px);
  z-index: 7;
}

.shot_view {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  overflow: hidden;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.bq_history_background {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: auto;
  pointer-events: none;
  margin-top: 84px;
  width: 100%;
  height: calc(100% - 84px);
}

.content {
  padding: 10px 10px 10px 10px;
  overflow-wrap: break-word;
  width: fit-content;
  max-width: calc(100% - 20px);
  display: inline-block;
}

.answer_items {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

.show_items {
  background: rgba(245, 245, 245, 0.8);
  border-radius: 10px;
  color: #1c1c1c;
  padding: 12px;
  z-index: 6;
  height: fit-content;
  width: calc(100% - 39px);
}

.close {
  position: absolute;
  top: 60px;
  width: 40px;
  height: 40px;
  z-index: 12;
  border-radius: 40px;
  left: calc(100% - 50px);
  background: rgba(245, 245, 245, 0.8);
  backdrop-filter: blur(10px);
}

#add {
  border: none;
  background: rgba(245, 245, 245, 0.8);
  margin-bottom: 20px;
  color: #545454;
  z-index: 5;
  width: 200px;
  height: 200px;
}

#add:hover {
  outline: none;
  color: #1a98ee;
  border: none;
  box-shadow: none;
}

#add:focus {
  outline: none;
  color: #1a98ee;
  border: none;
  box-shadow: none;
}

#add_new {
  position: absolute;
  color: transparent;
  background: rgba(26, 152, 238, 0.5);
  padding: 0;
  border: transparent;
  cursor: pointer;
  box-shadow: none;
  display: none;
}

.action_choice {
  background: rgba(255, 255, 255, 0.8);
  padding: 5px 15px;
  border-radius: 100px;
  cursor: pointer;
  margin: 5px 5px;
  min-width: fit-content;
  border: none;
  color: #1c1c1c;
}

.action_choice:hover,
.action_choice:focus {
  outline: none;
  color: #1a98ee;
  border: none;
  box-shadow: none;
}

</style>