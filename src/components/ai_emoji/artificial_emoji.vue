<script setup lang="ts">

//监听大小
import {ref} from "vue";
import {escapeHTML, getLocalData, getTokenData} from "../../operation/dataOperation.ts";
import Loading from "../weight/loading.vue";
import {getAddress} from "../../operation/address.ts";

const props = defineProps(['selected', 'all_text', 'note', 'small', 'tryDC'])
const emit = defineEmits(['add_note', 'stop-select'])
const show_talking_view = ref(false);
const show_write_view = ref(false);
const question = ref('')
const answer = ref('')
const write = ref('')
const isLoading = ref(false)
const note_ai_id = ref('')
const process_info = ref({computerName: "", memory: "", memoryUsage: "", ip: ""})

function makeMessage(): {}[] {
  let start = "";
  let second = "";
  let ques = ""
  if (props.all_text == props.selected) {
    start = '现有内容如下：\n' + props.all_text + '\n'
    ques = '我想知道的是：' + question.value
  } else if (props.selected.length < 20) {
    start = '现有文本如下：\n' + props.all_text + '\n（文本内容至此结束）\n'
    second = '我选中其中这么一段内容：' + props.selected + '\n'
    ques = '对于这段内容，我想问的是：' + question.value
  } else {
    start = '现有文本如下：\n' + props.all_text + '\n（文本内容至此结束）\n'
    second = '我选中其中这么一段内容：' + props.selected + '\n（选中该内容至此结束）\n'
    ques = '对于这段内容，我想问的是：' + question.value
  }
  let mess = [{
    role: "user",
    content: start + second + ques + "\n（备注：回答需要简单提炼，但是如果有重要过程或者代码要说）"
  }]
  return mess
}

async function sendMessage() {
  if (question.value != "") {
    answer.value = ""
    console.log(makeMessage())
    await post(makeMessage())
    console.log(props.selected)
  }
}

//发送信息并获取内容流式传输
async function post(messages: {}[]) {
  if (!isLoading.value) {
    isLoading.value = true
    try {
      const tk = await getTokenData()
      let address = ""
      if (props.tryDC) {
        process_info.value = {computerName: "", memory: "", memoryUsage: "", ip: ""}
        address = getAddress() + "/ai/dc"
      } else {
        address = getAddress() + "/ai/note"
      }
      // 发起 POST 请求
      const response = await fetch(
          address,
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            body: JSON.stringify({
              note_ai_id: note_ai_id.value,
              messages: messages,
              model: 'gemini-1.5-pro',
              id: getLocalData('id'),
              token: tk,
              selected: props.selected,
              question: question,
              allValue: props.all_text
            }),
          }
      );
      console.log(JSON.stringify({messages: messages}));
      if (response.body != null) {
        // 请求成功，处理返回的数据
        const reader = response.body.getReader()
        while (true) {
          const {done, value} = await reader.read()
          if (done) break
          const decodeValue = new TextDecoder().decode(value)
          //如果语段粘黏，分开！
          if (decodeValue.includes("}\n{")) {
            console.log("it take's two");
            const errDecodeValue = decodeValue.split("}\n{")
            for (let i = 0; i < errDecodeValue.length; i++) {
              if (i == 0) {
                console.log(i + ":" + errDecodeValue[i] + "}");
                decodeJsonToShow(errDecodeValue[i] + "}")
              } else if (i > 0 && i < errDecodeValue.length - 1) {
                console.log(i + ":" + errDecodeValue[i] + "}");
                decodeJsonToShow("{" + errDecodeValue[i] + "}")
              } else if (i == errDecodeValue.length - 1) {
                console.log(i + ":" + errDecodeValue[i] + "}");
                decodeJsonToShow("{" + errDecodeValue[i])
              }
            }
          } else {
            decodeJsonToShow(decodeValue)
          }
        }
      } else {
        answer.value = 'failed'
      }
    } catch (error) {
      // 请求失败，处理错误
      console.error('Error fetching data:', error);
      answer.value = 'failed'
    }
    isLoading.value = false
  } else {
    alert("请等待加载完成，若出错请刷新网页")
  }
}

function decodeJsonToShow(decodeValue: string) {
  console.log(decodeValue)
  //如果是末尾条，添加返回的ai表id：
  if (decodeValue.startsWith('{"response":"')) {
    try {
      note_ai_id.value = JSON.parse(decodeValue).response

    } catch (e) {
      console.error("done but:" + e)
    }
  } else if (props.tryDC && decodeValue.startsWith(`{"computerName":`)) {
    answer.value = ""
    process_info.value = JSON.parse(decodeValue);
  } else {
    try {
      const ss = JSON.parse(decodeValue).message.content
      if (typeof ss != 'undefined' && ss != "") {
        answer.value += ss
      }
    } catch (e) {
      console.error("get mess but:" + e)
    }
  }
}
</script>

<template>
  <img src="../../assets/emojis/watch.svg" alt="ai_emoji" style="position: absolute;z-index: -1;width: 0;height: 0">
  <img src="../../assets/emojis/think.svg" alt="ai_emoji" style="position: absolute;z-index: -1;width: 0;height: 0">
  <img src="../../assets/emojis/boom.svg" alt="ai_emoji" style="position: absolute;z-index: -1;width: 0;height: 0">
  <img src="../../assets/emojis/selute.svg" alt="ai_emoji" style="position: absolute;z-index: -1;width: 0;height: 0">
  <img src="../../assets/emojis/pen.svg" alt="pen_emoji" style="position: absolute;z-index: -1;width: 0;height: 0">
  <div class="background">
    <div v-if="show_talking_view&&!small" class="talking_view">
      <div
          style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: 100%;min-height: 24px;margin-top: 2px">
        {{ selected }}
      </div>
      <div style="flex-direction: row;margin-bottom: 5px;margin-top: 2px">
        <input placeholder="在此输入您的问题" style="width: calc(100% - 110px);margin-right: 5px" v-model="question"
               @keydown.enter="sendMessage()">
        <button @click="sendMessage()" style="width: 80px;border: transparent">
          发送
        </button>
      </div>
      <div v-if="answer==''&&!isLoading" style="display: flex;flex-direction: row;max-width: 380px;margin: auto">
        <button class="choice_talk" @click="question='对选中内容进行分析';sendMessage()">
          分析内容
        </button>
        <button class="choice_talk" @click="question='解释选中内容的作用';sendMessage()">
          解释作用
        </button>
        <button class="choice_talk" @click="question='对选中内容进行梳理';sendMessage()">
          梳理内容
        </button>
      </div>
      <loading v-if="isLoading"/>
      <div v-if="props.tryDC&&isLoading&&process_info.ip==''"
           style="width: 100%;text-align: center;overflow: auto;overflow-wrap: break-word;pcolor: #8a8a8a;font-size: 8px">
        正在分配算力贡献设备请稍后...
      </div>
      <div v-if="props.tryDC&&process_info.ip!=''"
           style="width: 100%;text-align: center;overflow-x: auto;overflow-y: hidden; min-height:10px;overflow-wrap: break-word;color: #8a8a8a;font-size: 8px">
        算力贡献设备信息：ip地址：{{ process_info.ip }}，设备名称：{{ process_info.computerName }}，内存大小：{{ process_info.memory }}
      </div>
      <div v-if="answer!=''" v-html="escapeHTML(answer)"
           style="overflow: auto;overflow-wrap: break-word;padding: 0 10px;margin-bottom: 5px;margin-top: 5px">

      </div>
      <button @click="emit('add_note',selected,question,answer);emit('stop-select')" v-if="answer!=''&&!isLoading"
              style="border: transparent">
        添加便签
      </button>
    </div>

    <div v-if="show_talking_view&&small" class="talking_view" style="max-width: calc(100% - 115px)">
      <div
          style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: 100%;min-height: 24px;margin-top: 2px">
        {{ selected }}
      </div>
      <div style="flex-direction: row;margin-bottom: 5px;margin-top: 2px">
        <input placeholder="在此输入您的问题" style="width: calc(100% - 110px);margin-right: 5px" v-model="question"
               @keydown.enter="sendMessage()">
        <button @click="sendMessage()" style="width: 80px;border: transparent">
          发送
        </button>
      </div>
      <div v-if="answer==''&&!isLoading" style="display: flex;flex-direction: row;max-width: 380px;margin: auto">
        <button class="choice_talk" @click="question='解释选中内容的作用';sendMessage()">
          解释作用
        </button>
        <button class="choice_talk" @click="question='对选中内容逐梳理';sendMessage()">
          梳理内容
        </button>
      </div>
      <loading v-if="isLoading"/>

      <div v-if="answer!=''" v-html="escapeHTML(answer)"
           style="overflow: auto;overflow-wrap: break-word;padding: 0 10px;margin-bottom: 5px;margin-top: 5px">

      </div>
      <button @click="emit('add_note',selected,question,answer)" v-if="answer!=''&&!isLoading"
              style="border: transparent">
        添加便笺
      </button>
    </div>

    <div v-if="show_write_view&&!small" class="write_view" style="min-width: 250px;">
      <div
          style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: 100%;min-height: 24px;margin-top: 2px">
        {{ selected }}
      </div>
      <textarea v-model="write" style="width: calc(100% - 35px);margin: 5px 5px;padding: 10px" rows="5"/>
      <button @click="emit('add_note',selected,'',write);emit('stop-select')" v-if="write!=''"
              style="border: transparent">
        添加便签
      </button>
    </div>

    <div v-if="show_write_view&&small" class="write_view" style="max-width: calc(100% - 115px);min-width: 250px;">
      <div
          style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;max-width: 100%;min-height: 24px;margin-top: 2px">
        {{ selected }}
      </div>
      <textarea v-model="write" style="width: calc(100% - 35px);margin: 5px 5px;padding: 10px" rows="5"/>
      <button @click="emit('add_note',selected,'',write);emit('stop-select')" v-if="write!=''"
              style="border: transparent">
        添加便签
      </button>
    </div>


    <div v-if="!small" style="flex-direction: column">
      <div class="ai_emoji" @click="show_write_view=false;show_talking_view=!show_talking_view">
        <transition>
          <img style="width: 55px;height: 55px" v-if="!isLoading&&answer==''" src="../../assets/emojis/watch.svg"
               alt="ai_emoji">
          <img style="width: 55px;height: 55px" v-else-if="isLoading" src="../../assets/emojis/think.svg"
               alt="ai_emoji">
          <img style="width: 55px;height: 55px" v-else-if="!isLoading&&answer=='failed'"
               src="../../assets/emojis/boom.svg" alt="ai_emoji">
          <img style="width: 55px;height: 55px" v-else-if="!isLoading&&answer!=''" src="../../assets/emojis/selute.svg"
               alt="ai_emoji">
        </transition>

        <div class="colorful_bold_text">AI便笺</div>
      </div>
      <div class="ai_emoji" style="margin-top: 15px" @click="show_talking_view=false;show_write_view=!show_write_view"
           v-if="props.note">
        <img src="../../assets/emojis/pen.svg" alt="pen_emoji" style="width: 55px;height: 55px">
        <div class="blue_bold_text">文字便笺</div>
      </div>
    </div>
    <div v-else-if="small">
      <div class="ai_emoji" style="min-width: 45px;max-width: 45px;min-height: 55px;max-height: 55px;margin-right: 8px"
           @click="show_write_view=false;show_talking_view=!show_talking_view">
        <transition>
          <img style="width: 45px;height: 45px" v-if="!isLoading&&answer==''" src="../../assets/emojis/watch.svg"
               alt="ai_emoji">
          <img style="width: 45px;height: 45px" v-else-if="isLoading" src="../../assets/emojis/think.svg"
               alt="ai_emoji">
          <img style="width: 45px;height: 45px" v-else-if="!isLoading&&answer=='failed'"
               src="../../assets/emojis/boom.svg" alt="ai_emoji">
          <img style="width: 45px;height: 45px" v-else-if="!isLoading&&answer!=''" src="../../assets/emojis/selute.svg"
               alt="ai_emoji">
        </transition>

        <div class="colorful_bold_text" style="font-size: 11px">AI便笺</div>
      </div>
      <div class="ai_emoji"
           style="min-width: 45px;max-width: 45px;min-height: 55px;max-height: 55px;margin-top: 15px;margin-right: 8px"
           @click="show_talking_view=false;show_write_view=!show_write_view" v-if="props.note">
        <img src="../../assets/emojis/pen.svg" style="width: 45px;height: 45px" alt="pen_emoji">
        <div class="blue_bold_text" style="font-size: 11px">文字便笺</div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.v-enter-active {
  transition: opacity 0.25s ease;
}

.v-leave-active {
  transition: opacity 0.25s ease;
  position: absolute;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.choice_talk {
  min-width: max-content;
  background: #1e1e1e;
  color: rgba(255, 255, 255, 0.9);
  border: transparent;
  width: calc(33% - 10px);
  padding: 12px 25px;
  margin: 0 5px;
  font-size: 14px;
}

.blue_bold_text {
  background: linear-gradient(45deg, #299bf8, #34b8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  font-size: 13px;
}

.colorful_bold_text {
  background: linear-gradient(45deg, #ea71ff, #18c3ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  font-size: 13px;
}

.background {
  width: 100%;
  height: 100%;
  position: absolute;
  background: none;
  display: flex;
  flex-direction: row;
  z-index: 550;
  justify-content: end;
  pointer-events: none;
}

.talking_view {
  user-select: none;
  /* 对于跨浏览器兼容性，可以添加以下前缀 */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  position: relative;
  margin-left: 10px;
  margin-top: 30vh;
  margin-right: 10px;
  box-shadow: 0 0 8px #bebebe;
  background-color: #f4f5f6;
  border-radius: 10px;
  max-width: 60%;
  display: flex;
  height: fit-content;
  padding: 10px;
  flex-direction: column;
  pointer-events: visible;
  max-height: 60%;
}

.write_view {
  user-select: none;
  /* 对于跨浏览器兼容性，可以添加以下前缀 */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  position: relative;
  margin-left: 10px;
  margin-top: calc(30vh + 85px);
  margin-right: 10px;
  box-shadow: 0 0 8px #bebebe;
  background-color: #f4f5f6;
  border-radius: 10px;
  max-width: 60%;
  display: flex;
  height: fit-content;
  padding: 10px;
  flex-direction: column;
  pointer-events: visible;
  max-height: 60%;
}


.ai_emoji {
  cursor: pointer;
  position: relative;
  margin-top: 30vh;
  margin-right: 20px;
  box-shadow: 0 0 8px #bebebe;
  background-color: #f4f5f6;
  border-radius: 10px;
  display: flex;
  padding: 10px;
  align-items: center;
  min-width: 55px;
  max-width: 55px;
  min-height: 72px;
  max-height: 72px;
  flex-direction: column;
  pointer-events: visible;
}

.ai_emoji_small {
  position: relative;
  margin-top: 25vh;
  margin-right: 10px;
  box-shadow: 0 0 8px #bebebe;
  background-color: #f4f5f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 5px;
  min-width: 55px;
  max-width: 55px;
  min-height: 72px;
  max-height: 72px;
  flex-direction: column;
  pointer-events: visible;
}
</style>