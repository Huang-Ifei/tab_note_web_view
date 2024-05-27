<script setup lang="ts">
import resize_textarea from "./weight/resize_textarea.vue";
import Icon_to_home from "./weight/icon_to_home.vue";
import {Ref, ref} from "vue";
import {delay, escapeHTML, getAccountImg, getLocalData} from "../operation/dataOperation.ts";
import {getAddress} from "../operation/address.ts";
import axios from "axios";

const messages: Ref<{}[]> = ref([])
const aiHistory: Ref<{}[]> = ref([])

const count = ref(0)
const ai_ms_id = ref("")
const text = ref("");

//发送信息并获取内容流式传输
async function post() {
  try {
    // 发起 POST 请求
    const response = await fetch(
        getAddress() + "/Ai_Messages",
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json;charset=utf-8'},
          body: JSON.stringify({
            ai_ms_id: ai_ms_id.value,
            messages: messages.value,
            model: 'gemini-1.5-pro-latest',
            id: getLocalData('id'),
            token: getLocalData('token')
          }),
        }
    );
    console.log(JSON.stringify({messages: messages.value}));
    const allValue = ref("")
    if (response.body != null) {
      // 请求成功，处理返回的数据
      const reader = response.body.getReader()
      count.value++
      let streamId = "stream" + count.value
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
              decodeJsonToShow(errDecodeValue[i] + "}", allValue, streamId)
            } else if (i > 0 && i < errDecodeValue.length - 1) {
              console.log(i + ":" + errDecodeValue[i] + "}");
              decodeJsonToShow("{" + errDecodeValue[i] + "}", allValue, streamId)
            } else if (i == errDecodeValue.length - 1){
              console.log(i + ":" + errDecodeValue[i] + "}");
              decodeJsonToShow("{" + errDecodeValue[i], allValue, streamId)
            }
          }
        } else {
          decodeJsonToShow(decodeValue, allValue, streamId)
        }
      }
      messages.value.push({role: 'model', content: allValue.value})
      await delay(500)
      await getAiHistory()
    }
  } catch (error) {
    // 请求失败，处理错误
    console.error('Error fetching data:', error);
  }
}

function decodeJsonToShow(decodeValue: string, allValue: Ref<string>, streamId: string) {
  //如果是末尾条，添加返回的ai表id：
  if (decodeValue.startsWith('{"response":"')) {
    console.log(JSON.parse(decodeValue).response)
    try {
      ai_ms_id.value = JSON.parse(decodeValue).response
    } catch (e) {
      console.error("done but:" + e)
    }
  } else {
    try {
      allValue.value += JSON.parse(decodeValue).message.content
      streamMess(allValue.value, streamId)
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
    const response = await axios.post(getAddress() + "/get_ai_history", {
      id: getLocalData("id"),
      token: getLocalData("token")
    });
    aiHistory.value = response.data.list
    console.log(aiHistory.value)
  } catch (error) {
    console.error(error)
  }
}

//新建对话
async function newChat() {
  const talking_view = document.getElementById("contents_view")
  if (talking_view) {
    talking_view.innerHTML = ""
  }
  count.value = 0
  messages.value = []
}

//获取历史对话
async function getHistoryAiMessages(aiMsId: string) {
  try {
    const response = await axios.post(getAddress() + "/get_history_ai_messages", {
      id: getLocalData("id"),
      token: getLocalData("token"),
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
      const jsonMes = JSON.parse(JSON.stringify(messages.value[i]))
      addHisMess(jsonMes.content, jsonMes.role)
      count.value++
    }
  } catch (error) {
    console.error(error)
  }
}

//吧获取到的历史内容在对话框中添加一条
function addHisMess(s: string, role: string) {
  if (s == null) {
    return
  }
  let ss = ''
  ss = escapeHTML(s)
  const talking_view = document.getElementById("contents_view")
  if (talking_view != null) {
    if (role == 'user') {
      talking_view.innerHTML +=
          "<div id='" + count.value + "' style='  display: flex;\n" +
          "  flex-direction: row;\n" +
          "  justify-content: flex-end;" +
          "  margin-left: 80px;" +
          "  position: relative;" +
          "  max-width: 100%;" +
          "  margin-right: 5%;" +
          "  margin-bottom: 10px'>" +
          "<div style='" +
          "  padding: 10px 2% 10px 2%;\n" +
          "  overflow-wrap: break-word; " +
          "  margin-right: 5px;" +
          "  border-radius: 10px;\n" +
          "  max-width: calc(100% - 50px - 4%);\n" +
          "  background: #f1f1f1;'>" + ss + "</div>" +
          " <img id='usrImage' src=" + getAccountImg() + " alt='image' style='  width: 45px;" +
          "  height: 45px;" +
          "  background: #ffffff;" +
          "  border-radius: 50%;' alt='usr'/></div>"
    } else if (role == 'model') {
      talking_view.innerHTML +=
          "<div id='" + "stream" + count.value + "' style='  display: flex;" +
          "  flex-direction: row;" +
          "  justify-content: flex-start;" +
          "  position: relative;" +
          "  max-width: 100%;" +
          "  margin: 10px 80px 10px 5%;'>" +
          " <img id='usrImage' src=" + getAddress() + "/image?name=ai.jpg" + " alt='image' style='  width: 45px;\n" +
          "  border: #f1f1f1 1px;" +
          "  height: 45px;" +
          "  background: #ffffff;" +
          "  border-radius: 50%;' alt='usr'/>" +
          "<div style='" +
          "  padding: 10px 2% 10px 2%;" +
          "  overflow-wrap: break-word; " +
          "  margin-left: 5px;" +
          "  border-radius: 10px;" +
          "  max-width: calc(100% - 50px - 4%);" +
          "  background: #f1f1f1;'>" + ss + "</div></div>"
    } else {
      talking_view.innerHTML +=
          "<div id='" + "stream" + count.value + "' style='  display: flex;" +
          "  flex-direction: row;" +
          "  position: relative;" +
          "  max-width: 100%;" +
          "  justify-content: flex-start;" +
          "  margin: 10px 80px 10px 5%;'>" +
          " <img id='usrImage' src=" + getAddress() + "/image?name=ai.jpg" + " alt='image' style='  width: 45px;\n" +
          "  border: #f1f1f1 1px;" +
          "  height: 45px;" +
          "  background: #ffffff;" +
          "  border-radius: 50%;' alt='usr'/>" +
          "<div style='" +
          "  padding: 10px 2% 10px 2%;" +
          "  overflow-wrap: break-word; " +
          "  margin-left: 5px;" +
          "  border-radius: 10px;" +
          "  max-width: calc(100% - 50px - 4%);" +
          "  background: #f1f1f1;'>" + ss + "</div></div>"
    }
  }
}

function setText(value: string) {
  text.value = value;
}

function addUsrMess(s: string) {
  let ss = ''
  ss = escapeHTML(s)
  //添加到messages里面
  messages.value.push({role: 'user', content: s})
  const talking_view = document.getElementById("contents_view")
  console.log(messages.value)
  if (talking_view != null) {
    count.value++
    talking_view.innerHTML +=
        "<div id='" + count.value + "' style='  display: flex;\n" +
        "  flex-direction: row;\n" +
        "  justify-content: flex-end;" +
        "  margin-left: 80px;" +
        "  margin-right: 5%;" +
        "  position: relative;" +
        "  max-width: 100%;" +
        "  margin-bottom: 10px'>" +
        "<div style='" +
        "  position: relative;" +
        "  padding: 10px 2% 10px 2%;\n" +
        "  overflow-wrap: break-word; " +
        "  margin-right: 5px;" +
        "  border-radius: 10px;\n" +
        "  max-width: calc(100% - 50px - 4%);\n" +
        "  background: #f1f1f1;'>" + ss + "</div>" +
        " <img id='usrImage' src=" + getAccountImg() + " alt='image' style='  width: 45px;" +
        "  height: 45px;" +
        "  background: #ffffff;" +
        "  border-radius: 50%;' alt='usr'/></div>"
  }
}

function streamMess(s: string, id: string) {
  let ss = ''
  ss = escapeHTML(s)
  const talking_view = document.getElementById("contents_view")
  const streamModule = document.getElementById(id)
  if (talking_view != null) {
    if (streamModule) {
      streamModule.innerHTML = " <img id='usrImage' src=" + getAddress() + "/image?name=ai.jpg" + " alt='image' style='  width: 45px;\n" +
          "  border: #f1f1f1 1px;" +
          "  height: 45px;" +
          "  background: #ffffff;" +
          "  border-radius: 50%;' alt='usr'/>" +
          "<div style='" +
          "  position: relative;" +
          "  padding: 10px 2% 10px 2%;" +
          "  overflow-wrap: break-word; " +
          "  margin-left: 5px;" +
          "  border-radius: 10px;" +
          "  max-width: calc(100% - 50px - 4%);" +
          "  background: #f1f1f1;'>" + ss + "</div>"
    } else {
      talking_view.innerHTML +=
          "<div id='" + id + "' style='  display: flex;" +
          "  position: relative;" +
          "  max-width: 100%;" +
          "  flex-direction: row;" +
          "  justify-content: flex-start;" +
          "  margin: 10px 80px 10px 5%;'>" +
          " <img id='usrImage' src=" + getAddress() + "/image?name=ai.jpg" + " alt='image' style='  width: 45px;\n" +
          "  border: #f1f1f1 1px;" +
          "  height: 45px;" +
          "  background: #ffffff;" +
          "  border-radius: 50%;' alt='usr'/>" +
          "<div style='" +
          "  position: relative;" +
          "  padding: 10px 2% 10px 2%;" +
          "  overflow-wrap: break-word; " +
          "  margin-left: 5px;" +
          "  border-radius: 10px;" +
          "  max-width: calc(100% - 50px - 4%);" +
          "  background: #f1f1f1;'>" + ss + "</div></div>"
    }
  }
}

function send(s: string) {
  text.value = s;
  addUsrMess(s)
  post()
}

</script>

<template>
  <div id="ai_view">
    <div class="left_items">
      <icon_to_home/>
      <div id="usrTalkHistory">
        <button @click="newChat">
          +新建对话+
        </button>
        <button v-for="value in aiHistory" :key="JSON.parse(JSON.stringify(value)).ai_ms_id"
                @click="getHistoryAiMessages(JSON.parse(JSON.stringify(value)).ai_ms_id.toString())">
          {{ JSON.parse(JSON.stringify(value)).mainly }}
        </button>
      </div>
      <button onclick="location.href='login'" id="usr">
        <button onclick="location.href='login'" class="imageButton">
          <img id="usrImage" :src="getAccountImg()" alt="image"/>
        </button>
        <div style="width: 100%;text-align: center;margin: 5px">
          {{ getLocalData('name') }}
        </div>
      </button>
    </div>
    <div class="ai_talking">
      <div id="talking_view" style="  padding-top: 20px;">
        <div v-if="messages.length==0">
          <div id="hello1">你好，{{ getLocalData("name") }}</div>
          <div id="hello2">欢迎使用AI助手，当Gemini 1.5 Pro受支持时，我们将优先为您分配</div>
        </div>
        <div id="contents_view">
        </div>
        <div id="stream_ai_mess">
        </div>
      </div>
      <div class="bottomInput">
        <resize_textarea :setText="setText" @doSend="send"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
#hello1 {
  padding: 1% 5% 0 5%;
  font-size: 60px;
  background: linear-gradient(45deg, #ec86ff, #34dbff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

#usrTalkHistory {
  height: calc(100% - 80px - 50px);
  width: 100%;
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
  margin-bottom: 8px;
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
  overflow: auto;
}

#talking_view {
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
}

.left_items {
  position: relative;
  background: rgb(245, 245, 245);
  height: 100%;
  margin: 0;
  padding: 0;
  width: 260px;
}

.ai_talking {
  display: flex;
  flex-direction: column;
  width: calc(100% - 260px);
  height: 100%;
  vertical-align: bottom;
}

.bottomInput {
  width: 80%;
  padding: 15px 10%;
  display: flex;
  flex-direction: row;
  background: white;
}

#usr {
  font-size: 15px;
  color: #1c1c1c;
  margin: 7px 10px;
  display: flex;
  flex-direction: row;
  padding-left: 15px;
  width: calc(100% - 20px);
  height: 52px;
  align-items: center;
  justify-items: center;
  background: #ffffff;
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
</style>