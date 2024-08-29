<script setup lang="ts">

//监听大小
import {ref} from "vue";
import {escapeHTML, getLocalData, getTokenData} from "../../operation/dataOperation.ts";
import Loading from "../weight/loading.vue";
import {getAddress} from "../../operation/address.ts";

const props = defineProps(['selected', 'all_text', 'note', 'small', 'alr', 'tryDC'])
const emit = defineEmits(['add_note', 'push_to_server'])
const show_talking_view = ref(false);
const question = ref('')
const answer = ref('')
const isLoading = ref(false)
const note_ai_id = ref('')
const withWholeText = ref(true)
const process_info = ref({computerName: "", memory: "", memoryUsage: "", ip: ""})

function makeMessage(): {}[] {
  let start = "";
  let ques = ""
  if (withWholeText.value === true && props.all_text != "") {
    start = '现有内容如下：\n' + props.all_text + '(内容到此结束)\n\n'
    ques = '你需要跟我说的是：' + question.value
  } else {
    ques = question.value
  }

  let mess = [{
    role: "user",
    content: start + ques + "\n（备注：回答需要简单提炼，但是如果有重要过程或者代码要说）"
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
              model: 'gemini-1.5-pro-latest',
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
}

</script>

<template>
  <div class="background">
    <div class="write_view" v-if="alr!=''&&!small">
      {{ alr }}
    </div>
    <div class="write_view" v-if="alr!=''&&small" style="margin-bottom: 15px;margin-right: 80px;">
      {{ alr }}
    </div>

    <div v-if="show_talking_view&&!small" class="talking_view">

      <div v-if="answer!=''" v-html="escapeHTML(answer)"
           style="overflow: auto;overflow-wrap: break-word;padding: 0 10px;margin-bottom: 5px;margin-top: 5px">
      </div>
      <button @click="copyText(answer)" v-if="answer!=''&&!isLoading"
              style="border: transparent">
        复制回答
      </button>
      <div v-if="props.tryDC&&isLoading&&process_info.ip==''"
           style="width: 100%;text-align: center;overflow: auto;overflow-wrap: break-word;color: #8a8a8a;font-size: 8px">
        正在分配算力贡献设备请稍后...
      </div>
      <div v-if="props.tryDC&&process_info.ip!=''"
           style="width: 100%;text-align: center;overflow-x: auto;overflow-y: hidden; min-height:10px;overflow-wrap: break-word;color: #8a8a8a;font-size: 8px">
        算力贡献设备信息：ip地址：{{ process_info.ip }}，设备名称：{{
          process_info.computerName
        }}，内存大小：{{ process_info.memory }}
      </div>
      <loading v-if="isLoading"/>

      <div style="display: flex;flex-direction: row;font-size: 14px">
        <input type="checkbox" v-model="withWholeText" class="check_box">
        附带笔记全文
      </div>

      <div style="flex-direction: row;margin-top: 2px">
        <input placeholder="在此输入您的问题" style="width: calc(100% - 110px);margin-right: 5px" v-model="question"
               @keydown.enter="sendMessage()">
        <button @click="sendMessage()" style="width: 80px;border: transparent">
          发送
        </button>
      </div>
    </div>

    <div v-if="show_talking_view&&small" class="talking_view" style="max-width: calc(100% - 115px);margin-bottom: 90px">

      <div v-if="answer!=''" v-html="escapeHTML(answer)"
           style="overflow: auto;overflow-wrap: break-word;padding: 0 10px;margin-bottom: 5px;margin-top: 5px">

      </div>
      <button @click="copyText(answer)" v-if="answer!=''&&!isLoading" style="border: transparent">
        复制回答
      </button>

      <loading v-if="isLoading"/>

      <div style="display: flex;flex-direction: row;font-size: 14px">
        <input type="checkbox" v-model="withWholeText" class="check_box">
        附带笔记全文
      </div>

      <div style="flex-direction: row;margin-top: 2px">
        <input placeholder="在此输入您的问题" style="width: calc(100% - 110px);margin-right: 5px" v-model="question"
               @keydown.enter="sendMessage()">
        <button @click="sendMessage()" style="width: 80px;border: transparent">
          发送
        </button>
      </div>
    </div>

    <div v-if="!small" style="flex-direction: column">
      <div class="ai_emoji"
           @click="process_info = {computerName:'',memory:'',memoryUsage:'',ip:''};show_talking_view=!show_talking_view;answer='';question='';">
        <img style="width: 45px;height: 45px" src="../../assets/messages.svg"
             alt="messages">
        <div class="colorful_bold_font">
          随手问
        </div>
      </div>
      <div class="ai_emoji" style="margin-top: 10px;margin-bottom: 10px" @click="emit('push_to_server')"
           v-if="props.note">
        <img style="width: 45px;height: 45px" src="../../assets/save.svg" alt="save">
        <div class="colorful_bold_font">
          保存
        </div>
      </div>
    </div>
    <div v-else-if="small">
      <div class="ai_emoji" style="margin-right: 8px"
           @click="show_talking_view=!show_talking_view;answer='';question=''">
        <img style="width: 45px;height: 45px" src="../../assets/messages.svg"
             alt="messages">
        <div class="colorful_bold_font">
          随手问
        </div>
      </div>
      <div class="ai_emoji" style="margin-bottom: 10px;margin-top: 10px;margin-right: 8px"
           @click="emit('push_to_server')" v-if="props.note">
        <img style="width: 45px;height: 45px" src="../../assets/save.svg" alt="save">
        <div class="colorful_bold_font">
          保存
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input{
  background: transparent;
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
  align-items: end;
  pointer-events: none;
}

.talking_view {
  position: relative;
  margin: 30vh 10px 93px 10px;
  box-shadow: 0 0 5px rgb(0, 0, 0, 0.2);
  background-color: rgba(250, 250, 250, 0.85);
  backdrop-filter: blur(5px);
  border-radius: 10px;
  max-width: calc(100% - 60px);
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
  position: absolute;
  margin-right: 95px;
  margin-bottom: 18px;
  box-shadow: 0 0 5px rgb(0, 0, 0, 0.2);
  background-color: rgba(250, 250, 250, 0.85);
  backdrop-filter: blur(5px);
  border-radius: 10px;
  max-width: 60%;
  display: flex;
  height: fit-content;
  padding: 10px;
  flex-direction: column;
  pointer-events: visible;
  max-height: 60%;
}

.colorful_bold_font{
  background: linear-gradient(0deg, #17375e, #0fa4d7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  font-size: 12px;
}

.ai_emoji {
  cursor: pointer;
  position: relative;
  width: 48px;
  margin-right: 20px;
  box-shadow: 0 0 5px rgb(0, 0, 0, 0.2);
  background-color: rgba(250, 250, 250, 0.85);
  backdrop-filter: blur(5px);
  display: flex;
  padding: 8px;
  border-radius: 10px;
  align-items: center;
  flex-direction: column;
  pointer-events: visible;
}

.check_box {
  width: 14px;
  height: 14px;
}

.check_box:hover {
  box-shadow: none;
}
</style>