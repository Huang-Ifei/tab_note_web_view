<script setup lang="ts">

import {useRoute} from "vue-router";
import axios from "axios";
import {getAddress} from "../operation/address.ts";
import {ref} from "vue";
import {escapeHTML, getIdImg, getLocalData} from "../operation/dataOperation.ts";
import Icon_to_home from "./weight/icon_to_home.vue";
import Messages_view from "./weight/messages_view.vue";

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

const route = useRoute()
console.log(route.query.tab_note_id)

getTabNote()

async function getTabNote() {
  const axiosResponse = await axios.get(getAddress() + "/tab_note?id=" + route.query.tab_note_id);

  if (axiosResponse.data.response == "success") {
    try {
      usr_name.value = axiosResponse.data.usr_name;
      usr_id.value = axiosResponse.data.usr_id;
      ip_address.value = axiosResponse.data.ip_address;
      class_name.value = axiosResponse.data.class_name;
      tab_note_name.value = axiosResponse.data.tab_note_name;
      tags.value = axiosResponse.data.tags;
      tab_note.value = axiosResponse.data.tab_note;
      click.value = axiosResponse.data.click;
      like_this.value = axiosResponse.data.like_this;
      date_time.value = axiosResponse.data.date_time;

      const c = document.getElementById("content")
      if (c != null) {
        c.innerHTML = escapeHTML(tab_note.value);
      }

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

</script>

<template>
  <div>
    <icon_to_home/>
  </div>
  <div id="background">
    <h2>
      {{ tab_note_name }}
    </h2>
    <div style="display: flex;flex-direction: row">
      <div class="value">
        <img src="../assets/visibility.svg">
        &nbsp;{{ click }}&nbsp;
      </div>
      <div class="value">
        <img :src="getIdImg(usr_id)">
        &nbsp;{{ usr_name }}&nbsp;
      </div>
      <div class="value">
        <img src="../assets/folder.svg">
        &nbsp;{{ class_name }}&nbsp;
      </div>
      <div class="value">
        <img src="../assets/calendar.svg">
        &nbsp;{{ date_time }}&nbsp;
      </div>
    </div>
    <div style="display: flex;flex-direction: row">
      <div class="value" @click="likeThis">
        <img src="../assets/thumb_up.svg">
        &nbsp;{{ like_this }}&nbsp;
      </div>
    </div>
    <a class="tags">
      {{ tags }}
    </a>
    <div id="content">

    </div>
    <messages_view :tab_note_id="route.query.tab_note_id"/>
  </div>
</template>

<style scoped>
img {
  border-radius: 100px;
  height: 25px;
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
}

.value {
  padding: 10px;
  background: #ebebeb;
  border-radius: 100px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;
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
  height: calc(100% - 78px);
  overflow: auto;
  position: absolute;
  display: flex;
  flex-direction: column;
}
</style>