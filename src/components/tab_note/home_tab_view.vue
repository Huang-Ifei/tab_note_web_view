<script setup lang="ts">

import {Ref, ref} from "vue";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";
import router from "../../router";
import Classes_bar from "../weight/classes_bar.vue";
import {getLocalData} from "../../operation/dataOperation.ts";
import Post_bar from "../post/post_bar.vue";

const page_count = ref(0)
const page_size = ref(1)
const page_list: Ref<{}[]> = ref([])
const search_value = ref("")
const class_name = ref("")
const post_show = ref(true)

search_value.value=getLocalData("search_value")
class_name.value=getLocalData("class_name")
searchTabNotePage()

async function searchTabNotePage() {
  page_size.value = 1;

  //如果这俩都是空返回的是true刚好给post show
  post_show.value = search_value.value == '' && class_name.value == '';

  sessionStorage.setItem("class_name", class_name.value);
  sessionStorage.setItem("search_value",search_value.value);

  const axiosResponse = await axios.post(getAddress() + "/tab_note_page",{
    page:page_size.value,
    key_word: search_value.value,
    class_name: class_name.value
  });

  if (axiosResponse.data.response == "success") {
    try {
      page_list.value = axiosResponse.data.list;
      page_count.value =axiosResponse.data.pages;
    } catch (e) {
      console.error(e)
    }
  } else if (axiosResponse.data.response == "token_check_failed") {
    console.error("token_check_failed")
  } else if (axiosResponse.data.response == "failed") {
    console.error("failed")
  } else {

  }
}

async function postSearch(s:string){
  search_value.value=s;
  await searchTabNotePage()
}

function show_tab_note(tab_note_id: string) {
  router.push({path: "/tab_note_view", query: {tab_note_id: tab_note_id}})
}

async function doChoice(s:string){
  class_name.value = s
  await searchTabNotePage()
}

async function valueChange(){
  if (search_value.value==""){
    await searchTabNotePage()
  }
}
</script>

<template>
  <div id="main_tab_notes_view">
    <div style="font-size: 26px;margin: 20px 10px 8px 10px;font-weight: bold;display: flex;flex-direction: row;align-items: center">
      TabNote贴文&nbsp;
      <img src="../../assets/forward_media.svg" style="cursor: pointer;height: 26px" @click="search_value='';class_name='';searchTabNotePage()">
      <div style=" display: flex;flex-direction: row;border-radius: 30px;margin-left: auto">
        <input id="search_input" v-model="search_value" placeholder="搜索内容" @change="valueChange"/>
        <button id="search_button" @click="searchTabNotePage()">
          搜索
        </button>
      </div>
    </div>
    <div id="page_tab_notes">

      <classes_bar :class_name="class_name" @doChoice="doChoice" style="margin-bottom: 5px"/>

      <post_bar v-if="post_show" @doSearch="postSearch"/>

      <div v-if="page_list.length%2==0" class="tab_note_row" v-for="i in page_list.length/2">
        <div class="tab_note" style="width: calc(45% - 20px)"
             @click="show_tab_note(JSON.parse(JSON.stringify(page_list[i * 2 - 2])).tab_note_id)">
          <div class="tab_note_title">
            {{ JSON.parse(JSON.stringify(page_list[i * 2 - 2])).tab_note_name }}
          </div>
          <div class="small_title">
            作者：{{
              JSON.parse(JSON.stringify(page_list[i * 2 - 2])).usr_name
            }}&nbsp;&nbsp;&nbsp;&nbsp;{{ JSON.parse(JSON.stringify(page_list[i * 2 - 2])).date_time }}
          </div>
        </div>

        <div v-if="(i*2-1)<page_list.length" class="tab_note"
             @click="show_tab_note(JSON.parse(JSON.stringify(page_list[i * 2 - 1])).tab_note_id)"
             style="width: calc(45% - 20px)">
          <div class="tab_note_title">
            {{ JSON.parse(JSON.stringify(page_list[i * 2 - 1])).tab_note_name }}
          </div>
          <div class="small_title">
            作者：{{
              JSON.parse(JSON.stringify(page_list[i * 2 - 1])).usr_name
            }}&nbsp;&nbsp;&nbsp;&nbsp;{{ JSON.parse(JSON.stringify(page_list[i * 2 - 1])).date_time }}
          </div>
        </div>
      </div>

      <div v-if="page_list.length%2==1" class="tab_note_row" v-for="i in page_list.length/2+0.5">
        <div class="tab_note" @click="show_tab_note(JSON.parse(JSON.stringify(page_list[i * 2 - 2])).tab_note_id)">
          <div class="tab_note_title">
            {{ JSON.parse(JSON.stringify(page_list[i * 2 - 2])).tab_note_name }}
          </div>
          <div class="small_title">
            作者：{{
              JSON.parse(JSON.stringify(page_list[i * 2 - 2])).usr_name
            }}&nbsp;&nbsp;&nbsp;&nbsp;{{ JSON.parse(JSON.stringify(page_list[i * 2 - 2])).date_time }}
          </div>
        </div>

        <div v-if="(i*2-1)<page_list.length" class="tab_note"
             @click="show_tab_note(JSON.parse(JSON.stringify(page_list[i * 2 - 1])).tab_note_id)"
             style="width: calc(45% - 30px)">
          <div class="tab_note_title">
            {{ JSON.parse(JSON.stringify(page_list[i * 2 - 1])).tab_note_name }}
          </div>
          <div class="small_title">
            作者：{{
              JSON.parse(JSON.stringify(page_list[i * 2 - 1])).usr_name
            }}&nbsp;&nbsp;&nbsp;&nbsp;{{ JSON.parse(JSON.stringify(page_list[i * 2 - 1])).date_time }}
          </div>
        </div>
      </div>

    </div>

    <div id="page_choice">
      <button style="background: #f5f5f5;margin-right: 10px" v-if="page_size>1" @click="page_size--;searchTabNotePage()">
        上一页
      </button>
      第{{ page_size }}页/共{{ page_count }}页
      <button style="background: #f5f5f5;margin-left: 10px" v-if="page_size<page_count"
              @click="page_size++;searchTabNotePage()">
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
#search_button {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 30px;
  border: transparent;
}

#search_button:hover,
#search_button:focus {
  outline: none;
  box-shadow: 0 0 8px #bbe6ff;
  border: none;
}

#search_input {
  width: 200px;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 30px;
  margin-right: 3px;
  border: #e5e5e5 solid 1px;
}
#search_input:hover,
#search_input:focus {
  outline: none;
  border: #1a98ee solid 1px;
}

.tab_note_row {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.tab_note_title {
  font-size: 18px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.small_title{
  font-size: 12px;
  color: #626771
}
.tab_note {
  cursor: pointer;
  padding: 32px 20px;
  margin: 8px 8px;
  width: calc(50% - 56px);
  min-width: calc(50% - 56px);
  background: white;
  border-radius: 10px;
  border: 1px solid #e6e7ec;
  color: #1c1c1c;
  text-align: left;
}

.tab_note:hover {
  border: #1c99ee solid 1px;
  box-shadow: 0 0 8px #c6e9ff;
}

#page_choice {
  margin-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 50px;
  color: #1c1c1c;
}

#page_choice button {
  color: #1c1c1c;
}

#main_tab_notes_view {
  display: flex;
  flex-direction: column;
  background-color: #f6f7f8;
  width: 84%;
  padding: 0 8%;
  height: calc(100% + 4px);
  overflow: auto;
}
</style>