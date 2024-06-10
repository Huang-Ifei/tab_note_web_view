<script setup lang="ts">
import {Ref, ref} from "vue";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";
import { escapeHTMLWithOutConsole, getIdImg, getLocalData} from "../../operation/dataOperation.ts";

const props = defineProps(['tab_note_id'])
const tab_note_id = props.tab_note_id
const message = ref("")
const messages_show = ref(false)
const can_add_more_tab_mess = ref(true)


type TabMess = {
  usr_id:string,
  usr_name: string,
  like_this: number,
  message: string,
  message_id: string,
  date_time: string,
  can_not_show_reply: boolean,
  can_not_show_more_reply: boolean,
  reply: boolean
  reply_value: string,
  reply_messages: MessMess[]
}
type MessMess = {
  usr_id:string,
  usr_name: string,
  like_this: number,
  date_time: string,
  message: string,
  message_id: string,
  reply: boolean
  reply_value: string,
  reply_usr:string
}
const messages: Ref<TabMess[]> = ref([])

async function getMessages() {
  messages_show.value = false
  const message_length = messages.value.length
  console.log(message_length)
  const axiosResponse = await axios.post(getAddress() + "/tab_note_mess", {
    tab_note_id: tab_note_id,
    start: message_length,
  })
  if (axiosResponse.data.response == "success") {
    messages.value = axiosResponse.data.messages
    messages_show.value = true
  } else {
    console.log(axiosResponse.data.response)
    await getMessages()
  }
}

async function getMoreMessages() {
  const message_length = messages.value.length
  console.log(message_length)
  const axiosResponse = await axios.post(getAddress() + "/tab_note_mess", {
    tab_note_id: tab_note_id,
    start: message_length,
  })
  if (axiosResponse.data.response == "success") {
    const moreMessages:Ref<TabMess[]> = ref([])
    moreMessages.value = axiosResponse.data.messages

    for(let a of moreMessages.value){
      messages.value.push(a)
    }

    if (moreMessages.value.length == 0){
      can_add_more_tab_mess.value = false
    }
  } else {
    console.log(axiosResponse.data.response)
    await getMessages()
  }
}

getMessages()

async function like_mess(route: string, m_id: string) {
  await axios.post(getAddress() + route, {
    mess_id: m_id,
    id: getLocalData("id"),
    token: getLocalData("token"),
  })
}

async function getMessMess(i:number,from_tab_mess:string) {
  const start = ref(0);
  if (typeof (messages.value[i].reply_messages)!="undefined") {
      start.value=messages.value[i].reply_messages.length
  }
  if (start.value>0){
    messages.value[i].reply_messages=[]
    messages.value[i].can_not_show_more_reply = false
    return
  }
  const axiosResponse = await axios.post(getAddress() + "/mess_mess", {
    from_tab_mess: from_tab_mess,
    start: start.value,
  })
  if (axiosResponse.data.response == "success") {
    messages.value[i].reply_messages = axiosResponse.data.messages
    if (messages.value[i].reply_messages.length==0){
      messages.value[i].can_not_show_reply=true
    }
  }
}

async function getMoreMessMess(i:number,from_tab_mess:string){
  const axiosResponse = await axios.post(getAddress() + "/mess_mess", {
    from_tab_mess: from_tab_mess,
    start: messages.value[i].reply_messages.length,
  })
  if (axiosResponse.data.response == "success") {
    const moreMessages:MessMess[] = axiosResponse.data.messages
    for(let mm of moreMessages){
      messages.value[i].reply_messages.push(mm)
    }
    if (moreMessages.length==0){
      messages.value[i].can_not_show_more_reply=true
    }
  }
}

async function insertMessMess(from_tab_mess:string,reply_mess_id:string,mess:string,i:number,ii:number) {
  if (mess.length <= 0) {
    alert("请填写内容")
  }
  const axiosResponse = await axios.post(getAddress() + "/mess_mess_add", {
    id: getLocalData("id"),
    token: getLocalData("token"),
    reply_message_id: reply_mess_id,
    from_tab_mess:from_tab_mess,
    message: mess,
  })

  if (axiosResponse.data.response == "success") {
    const a:MessMess = {
      usr_id:getLocalData("id"),
      reply_usr: "",
      date_time: "",
      message_id: "",
      reply: false,
      reply_value: "",
      usr_name: getLocalData("name"),
      like_this:0,
      message:mess}
    if (messages.value[i].message_id!=from_tab_mess){
      a.reply_usr=messages.value[i].usr_name
    }

    if ( typeof messages.value[i].reply_messages==="undefined" ) {
      messages.value[i].reply_messages=[]
    }
    messages.value[i].reply_messages.push(a)
    //如果是tab_mess的回复,清空回复并关闭其回复栏
    if (from_tab_mess==reply_mess_id) {
      messages.value[i].reply_value = ""
      messages.value[i].reply=false
    }else{
      //如果是mess_mess的回复,清空回复并关闭其回复栏
      messages.value[i].reply_messages[ii].reply_value = ""
      messages.value[i].reply_messages[ii].reply=false
    }
  } else {
    alert("留言发送错误")
  }
}

async function insertMessage() {
  if (message.value.length <= 0) {
    alert("请填写内容")
    return
  }
  const axiosResponse = await axios.post(getAddress() + "/tab_mess_add", {
    id: getLocalData("id"),
    token: getLocalData("token"),
    tab_note_id: tab_note_id,
    message: message.value,
  })
  if (axiosResponse.data.response == "success") {

    console.log(axiosResponse.data)

    message.value = ""
    messages.value = []
    await getMessages()
  } else {
    alert("留言发送错误")
  }
}
</script>

<template>
  <div class="background">
    <div style="margin-left: 10px;font-weight: bold;font-size: 18px">
      留言
    </div>
    <div class="input_message">
      <textarea v-model="message" class="message_textarea">
        </textarea>
      <button id="submit" @click="insertMessage">
        发送
      </button>
    </div>
    <div v-if="messages.length>0" style="margin-left: 10px;font-weight: bold;font-size: 18px">
      留言记录
    </div>

    <div v-if="messages_show" style="display: flex;flex-direction: column;margin-top: 10px">
      <div v-for="(mess, i) in messages" :key="i" class="messages">

        <div class="value">
          <img alt="" :src="getIdImg(mess.usr_id)">
          &nbsp;{{mess.usr_name }}&nbsp;
        </div>

        <div style="margin: 3px 10px;font-size: 14px" v-html="escapeHTMLWithOutConsole(mess.message)">
        </div>

        <div style="display: flex;flex-direction: row;">
          <div class="value_click" @click="like_mess('/tab_mess_like',mess.message_id);mess.like_this++">
            <img alt="" src="../../assets/thumb_up.svg">
            {{ mess.like_this }}
          </div>
          <div class="value_click" @click="mess.reply=!mess.reply">
            &nbsp;回复&nbsp;
          </div>
          <div v-if="!mess.can_not_show_reply" class="value_click" @click="getMessMess(i,mess.message_id)">
            &nbsp;展开回复&nbsp;
          </div>
        </div>

        <div v-if="mess.reply" class="input_message">
          <textarea v-model="mess.reply_value" class="mess_mess_textarea">
           </textarea>
            <button id="submit" @click="insertMessMess(mess.message_id,mess.message_id,mess.reply_value,i,-1)">
              发送
            </button>
        </div>
        <!-- 留言的留言  -->
        <div v-for="(messMess, ii) in mess.reply_messages" :key="ii" class="message_message">
          <div class="value">
            <img alt="" :src="getIdImg(messMess.usr_id)">
            &nbsp;{{ messMess.usr_name }}&nbsp;
          </div>
          <div style="display: inline-block; margin: 0 8px; padding: 3px;">
            <div v-if="messMess.reply_usr!=''" style="color: #1c1c1c;display: inline-block;font-weight: bold">回复[{{messMess.reply_usr}}]:&nbsp;</div>
            <div style="margin: 0;font-size: 14px;display: inline-block" v-html="escapeHTMLWithOutConsole(messMess.message)"></div>
          </div>
          <div style="display: flex;flex-direction: row;">
            <div class="value_click" @click="like_mess('/mess_mess_like',messMess.message_id);messMess.like_this++">
              <img alt="" src="../../assets/thumb_up.svg">
              {{ messMess.like_this }}
            </div>
            <div class="value_click" @click="messMess.reply=!messMess.reply">
              &nbsp;回复&nbsp;
            </div>
          </div>
          <div v-if="messMess.reply" class="input_message">
          <textarea v-model="messMess.reply_value" class="mess_mess_textarea">
           </textarea>
            <button id="submit" @click="insertMessMess(mess.message_id,messMess.message_id,messMess.reply_value,i,ii)">
              发送
            </button>
          </div>
        </div>
        <div v-if="!mess.can_not_show_more_reply&& typeof mess.reply_messages !='undefined' &&mess.reply_messages.length>0" @click="getMoreMessMess(i,mess.message_id)" class="more_mess" style="margin-left: 38px;margin-bottom: 10px">
          获取更多回复
        </div>
        <!-- 留言的留言  -->
      </div>
    </div>

    <div v-if="can_add_more_tab_mess&&messages.length>0" @click="getMoreMessages" style="margin-left: 8px;" class="more_mess">
      获取更多留言
    </div>
  </div>
</template>

<style scoped>
.more_mess{
  cursor: pointer;
  color:#1c99ee;
  font-weight: bold
}
.more_mess:hover{
  text-shadow: #b6deff 0 0 2px
}
.value_click {
  padding: 10px;
  background: transparent;
  border-radius: 100px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;
  height: fit-content;
  margin-right: 10px;
  cursor: pointer;
  font-size: 14px;
  border: transparent solid 1px;
}

.value_click:hover {
  box-shadow: 0 0 8px #c6e9ff;
  outline: #1a98ee solid 1px;
}

.value {
  padding: 10px;
  background: #f0f0f0;
  border: transparent solid 1px;
  border-radius: 100px;
  margin-bottom: 2px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;
  height: fit-content;
  margin-right: 10px;
  cursor: pointer;
  font-size: 14px;
}

.value img {
  border-radius: 100px;
  height: 20px;
  width: 20px;
  padding: 0;
  margin: 0;
}

.message_message {
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
  margin-left: 30px;
}

.messages {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px
}

#submit {
  border: transparent;
  height: fit-content;
  width: fit-content;
  padding: 11px 28px;
  border-radius: 50px;
  margin-top: 5px;
  box-shadow: 0 0 8px #9bd6ff;
}

.background {
  font-size: 15px;
  padding-top: 20px;
  padding-bottom: 50px;
}

.input_message{
  margin-left: 20px;
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  width: 70%;
}

.message_textarea {
  height: 100px;
}
.mess_mess_textarea{
  height: 60px;
}

</style>