<script setup lang="ts">

import {useRoute} from "vue-router";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";
import {onBeforeMount, onBeforeUnmount, Ref, ref} from "vue";
import {escapeTabNoteToHTML, getIdImg, getLocalData, isApp} from "../../operation/dataOperation.ts";
import Icon_to_home from "../weight/icon_to_home.vue";
import Messages_view from "./messages_view.vue";

const usr_name = ref("")
const usr_id = ref("")
const ip_address = ref("")
const class_name = ref("")
const tab_note_name = ref("")
const tags = ref("")
const tab_note = ref("")
const click = ref(0)
const like_this = ref(0)
const date_time = ref("")
const imgs: Ref<string[]> = ref([])
const escapeString = ref("")
const file = ref("")

const route = useRoute()

getTabNote()

async function getTabNote() {
  const axiosResponse = await axios.get(getAddress() + "/tab_note?id=" + route.query.tab_note_id);

  if (axiosResponse.data.response == "success") {
    try {
      usr_name.value = axiosResponse.data.usr_name
      usr_id.value = axiosResponse.data.usr_id
      ip_address.value = axiosResponse.data.ip_address
      class_name.value = axiosResponse.data.class_name
      tab_note_name.value = axiosResponse.data.tab_note_name
      tags.value = axiosResponse.data.tags
      tab_note.value = axiosResponse.data.tab_note
      click.value = axiosResponse.data.click
      like_this.value = axiosResponse.data.like_this
      date_time.value = axiosResponse.data.date_time
      file.value = axiosResponse.data.file
      let imgArray = axiosResponse.data.imgs.images
      if (typeof imgArray != 'undefined' &&imgArray.length>0){
        for (let imgValue of imgArray) {
          imgs.value.push(getAddress() + "/tabNoteImg?name=" + imgValue)
        }
      }
      escapeString.value = escapeTabNoteToHTML(tab_note.value, imgs.value);

      await axios.post(getAddress() + "/tab_note_click", {
        tab_note_id: route.query.tab_note_id,
        id: getLocalData("id"),
        token: getLocalData("token")
      })
    } catch (e) {
      console.error(e)
    }
  } else if (axiosResponse.data.response == "failed") {
    console.error("failed")
  } else {

  }
}

async function likeThis() {
  like_this.value++;
  await axios.post(getAddress() + "/tab_note_like", {
    tab_note_id: route.query.tab_note_id,
    id: getLocalData("id"),
    token: getLocalData("token")
  })
}

function download_this(s:string) {
  window.open(getAddress()+"/file_select?name="+s)
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
  if (width < 680||isApp()) {
    smallScreen.value = true;
  }
  else {
    smallScreen.value = false;
  }
}

</script>

<template>
  <div style="position: absolute;overflow: auto;width: 100%;height: 100%">
    <div>
      <icon_to_home/>
    </div>
    <div id="background">
      <h2>
        {{ tab_note_name }}
      </h2>
      <!--手机端小按钮-->
      <div class="value" v-if="smallScreen">
        <img :src="getIdImg(usr_id)">
        &nbsp;{{ usr_name }}&nbsp;
      </div>
      <div class="value" v-if="smallScreen" >
        <img src="../../assets/calendar.svg">
        &nbsp;{{ date_time }}&nbsp;
      </div>
      <div style="display: flex;flex-direction: row;overflow: auto" v-if="smallScreen">
        <div class="click_value" @click="likeThis">
          <img src="../../assets/thumb_up.svg">
          &nbsp;{{ like_this }}&nbsp;
        </div>
        <div class="click_value" v-if="file!=''" @click="download_this(file)">
          <img src="../../assets/download.svg">
          &nbsp;下载附件&nbsp;
        </div>
        <div class="value">
          <img src="../../assets/visibility.svg">
          &nbsp;{{ click }}&nbsp;
        </div>
        <div class="value">
          <img src="../../assets/folder.svg">
          &nbsp;{{ class_name }}&nbsp;
        </div>
      </div>
      <!--电脑端小按钮-->
      <div style="display: flex;flex-direction: row" v-if="!smallScreen">
        <div class="value">
          <img src="../../assets/visibility.svg">
          &nbsp;{{ click }}&nbsp;
        </div>
        <div class="value">
          <img :src="getIdImg(usr_id)">
          &nbsp;{{ usr_name }}&nbsp;
        </div>
        <div class="value">
          <img src="../../assets/folder.svg">
          &nbsp;{{ class_name }}&nbsp;
        </div>
        <div class="value">
          <img src="../../assets/calendar.svg">
          &nbsp;{{ date_time }}&nbsp;
        </div>
      </div>
      <div style="display: flex;flex-direction: row" v-if="!smallScreen">
        <div class="click_value" @click="likeThis">
          <img src="../../assets/thumb_up.svg">
          &nbsp;{{ like_this }}&nbsp;
        </div>
        <div class="click_value" v-if="file!=''" @click="download_this(file)">
          <img src="../../assets/download.svg">
          &nbsp;下载附件&nbsp;
        </div>
      </div>
      <a class="tags">
        {{ tags }}
      </a>
      <div id="content" v-html="escapeString">

      </div>
      <messages_view :tab_note_id="route.query.tab_note_id" :smallScreen="smallScreen"/>
    </div>
  </div>
</template>

<style scoped>
img {
  border-radius: 100px;
  height: 25px;
  width: 25px;
  padding: 0;
  margin: 0;
}

#content {
  margin: 10px;
  width: calc(100% - 20px);
  position: relative;
  overflow-wrap: break-word;
}

.tags {
  display: flex;
  flex-direction: row;
  margin: 10px;
  font-weight: bold;
}

.click_value:hover {
  background: #f8f8f8;
  border: #1a98ee solid 1px;
}

.click_value {
  padding: 10px;
  background: #f0f0f0;
  border: transparent solid 1px;
  border-radius: 100px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;
  height: fit-content;
  white-space: nowrap;
  margin-right: 10px;
  cursor: pointer;
}

.value {
  padding: 10px;
  background: #f0f0f0;
  border: transparent solid 1px;
  border-radius: 100px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;
  white-space: nowrap;
  height: fit-content;
  margin-right: 10px;
  cursor: pointer;
}

h2 {
  margin: 12px 10px;
}

#background {
  width: 94%;
  padding: 10px 3%;
  position: relative;
  display: flex;
  flex-direction: column;
}
</style>