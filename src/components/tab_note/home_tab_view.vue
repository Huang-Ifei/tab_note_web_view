<script setup lang="ts">

import {Ref, ref} from "vue";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";
import router from "../../router";
import Classes_bar from "../weight/classes_bar.vue";
import {getLocalData, getLocalNumber} from "../../operation/dataOperation.ts";
import Post_bar from "../post/post_bar.vue";
import Bei_an from "../bei_an.vue";

const props = defineProps(['smallScreen'])

type tab_list = {
  tab_note_id: string,
  usr_name: string,
  usr_id: string,
  class_name: string,
  tab_note_name: string,
  tags: string,
  like_this: number,
  date_time: string,
}

const page_count = ref(0)
const page_size = ref(1)
const page_list: Ref<tab_list[]> = ref([])
const search_value = ref("")
const class_name = ref("")
const post_show = ref(true)
const classes = ref([])
const tags = ref(["#Oracle", "#JavaWeb期末复习", "#git", "#Vue", "#数据库期末复习", "#数据库", "#视图", "#SpringBoot"])

search_value.value = getLocalData("search_value")
class_name.value = getLocalData("class_name")
page_size.value = getLocalNumber("page_size")
searchTabNotePage()

async function searchTabNotePage() {
  page_count.value = 1;

  //如果这俩都是空返回的是true刚好给post show
  post_show.value = search_value.value == '' && class_name.value == '';

  sessionStorage.setItem("page_size", page_size.value.toString());
  sessionStorage.setItem("class_name", class_name.value);
  sessionStorage.setItem("search_value", search_value.value);

  const axiosResponse = await axios.post(getAddress() + "/tab_note_page", {
    page: page_size.value,
    key_word: search_value.value,
    class_name: class_name.value
  });

  if (axiosResponse.data.response == "success") {
    try {
      page_list.value = axiosResponse.data.list;
      console.log(page_list.value);
      page_count.value = axiosResponse.data.pages;
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

async function postSearch(s: string) {
  search_value.value = s;
  page_size.value = 1;
  await searchTabNotePage()
}

function show_tab_note(tab_note_id: string) {
  router.push({path: "/tab_note_view", query: {tab_note_id: tab_note_id}})
}

async function doChoice(s: string) {
  class_name.value = s
  page_size.value = 1;
  await searchTabNotePage()
}

async function valueChange() {
  if (search_value.value == "") {
    page_size.value = 1;
    await searchTabNotePage()
  }
}

async function getClasses() {
  const axiosResponse = await axios.get(getAddress() + "/getClasses")
  if (axiosResponse.data.response == "success") {
    classes.value = axiosResponse.data.classes
  } else {
    console.log(axiosResponse.data.response)
  }
}

getClasses()

</script>

<template>
  <div id="main_tab_notes_view" v-if="smallScreen">
    <div style="min-height: 54px">

    </div>
    <div v-if="smallScreen"
         style="font-size: 1.5rem;margin: 12px 10px 10px 10px;font-weight: bold;display: flex;flex-direction: row;align-items: center">
      贴文&nbsp;
      <img src="../../assets/forward_media.svg" style="cursor: pointer;height: 1.2rem"
           @click="search_value='';class_name='';page_size=1;searchTabNotePage()">
      <div style=" display: flex;flex-direction: row;border-radius: 1rem;margin-left: auto">
        <input id="search_input" v-model="search_value" placeholder="搜索内容" @change="valueChange"/>
        <button id="search_button" @click="page_size=1;searchTabNotePage()">
          搜索
        </button>
      </div>
    </div>
    <div id="page_tab_notes">

      <div v-if="!smallScreen" style="min-height: 10px">

      </div>

      <classes_bar v-if="smallScreen" :classes="classes" :class_name="class_name" @doChoice="doChoice"/>

      <classes_bar v-if="smallScreen" :class_name="search_value" :classes="tags" @doChoice="postSearch"/>

      <post_bar v-if="post_show" @doSearch="postSearch" :smallScreen="props.smallScreen"/>

      <div v-if="page_list.length==0"
           style="width: 100%;height: calc(100vh - 230px);display: flex;flex-direction: column;justify-content: center;align-items: center;">
        暂无对应内容，点击重置刷新
      </div>

      <div v-if="smallScreen && post_show" @click="router.push('beat_question')"
           style="background: white;height: 50px;display: flex;flex-direction: row;justify-content: center;align-items: center;border-radius: 10px;border: 1px solid #e6e7ec;margin: 5px 8px 0;font-weight: bold">
        <img alt="相机" style="width: 20px;height: 20px;margin-right: 5px" src="../../assets/camera.svg"/>AI识题
      </div>

      <div v-for="tab in page_list">
        <div class="tab_note" style="width: calc(100% - 56px)"
             @click="show_tab_note(tab.tab_note_id)">
          <div class="tab_note_title">
            {{ tab.tab_note_name }}
          </div>
          <div class="small_title">
            作者：{{
              tab.usr_name
            }}&nbsp;&nbsp;&nbsp;&nbsp;{{ tab.date_time }}
          </div>
        </div>
      </div>
    </div>

    <div id="page_choice" v-if="page_list.length!=0">
      <div class="page_select" v-if="page_size>1" @click="page_size--;searchTabNotePage()">
        上一页
      </div>
      <div style="background: transparent;width: 88px" v-else-if="!(page_size>1)">
      </div>
      <div style="background: transparent;">
        第{{ page_size }}页/共{{ page_count }}页
      </div>
      <div class="page_select" v-if="page_size<page_count"
           @click="page_size++;searchTabNotePage()">
        下一页
      </div>
      <div style="background: transparent;width: 88px" v-else-if="!(page_size<page_count)">
      </div>
    </div>
    <bei_an style="width: calc(100% - 20px)"/>
  </div>
  <div id="main_tab_notes_view" v-else style="width: 66%">
    <div v-if="smallScreen"
         style="font-size: 1.5rem;margin: 12px 10px 10px 10px;font-weight: bold;display: flex;flex-direction: row;align-items: center">
      贴文&nbsp;
      <img src="../../assets/forward_media.svg" style="cursor: pointer;height: 1.2rem"
           @click="search_value='';class_name='';page_size=1;searchTabNotePage()">
      <div style=" display: flex;flex-direction: row;border-radius: 1rem;margin-left: auto">
        <input id="search_input" v-model="search_value" placeholder="搜索内容" @change="valueChange"/>
        <button id="search_button" @click="page_size=1;searchTabNotePage()">
          搜索
        </button>
      </div>
    </div>
    <div id="page_tab_notes">

      <div v-if="!smallScreen" style="min-height: calc(10px + 54px)">

      </div>

      <post_bar v-if="post_show" @doSearch="postSearch" :smallScreen="props.smallScreen"/>

      <div v-if="page_list.length==0"
           style="width: 100%;height: calc(100vh - 64px);display: flex;flex-direction: column;justify-content: center;align-items: center;">
        暂无对应内容，点击重置刷新
      </div>

      <div v-for="tab in page_list">
        <div class="tab_note" style="width: calc(100% - 56px)"
             @click="show_tab_note(tab.tab_note_id)">
          <div class="tab_note_title">
            {{ tab.tab_note_name }}
          </div>
          <div class="small_title">
            作者：{{
              tab.usr_name
            }}&nbsp;&nbsp;&nbsp;&nbsp;{{ tab.date_time }}
          </div>
        </div>
      </div>
    </div>

    <div id="page_choice" v-if="page_list.length!=0">
      <div class="page_select" v-if="page_size>1" @click="page_size--;searchTabNotePage()">
        上一页
      </div>
      <div style="background: transparent;width: 88px" v-else-if="!(page_size>1)">
      </div>
      <div style="background: transparent;">
        第{{ page_size }}页/共{{ page_count }}页
      </div>
      <div class="page_select" v-if="page_size<page_count"
           @click="page_size++;searchTabNotePage()">
        下一页
      </div>
      <div style="background: transparent;width: 88px" v-else-if="!(page_size<page_count)">
      </div>
    </div>
    <bei_an style="width: calc(100% - 20px)"/>
  </div>

  <div class="right_list" v-if="!smallScreen">
    <div style=" display: flex;flex-direction: row;max-width: 100%">
      <div
          style="display: flex;flex-direction: column;font-size: 10px;align-items: center;justify-content: center;margin-right: 5px;min-width: fit-content">
        <img src="../../assets/forward_media.svg" style="cursor: pointer;height: 22px"
             @click="search_value='';class_name='';page_size=1;searchTabNotePage()">
        重置
      </div>
      <input id="search_input" style="width: 100%" v-model="search_value" placeholder="搜索内容" @change="valueChange"/>
      <button id="search_button" style="min-width: fit-content" @click="page_size=1;searchTabNotePage()">
        搜索
      </button>
    </div>
    <div class="right_items">
      <div style="display: flex;flex-direction: column;height: 50%;">
        <div style="font-size: 1.2rem;font-weight: bold;padding: 5px 5px 0 5px">
          分类选择
        </div>
        <div style="overflow-y: auto;">
          <div v-for="(class_n , index) in classes" :key="index" class="choice_class">
            <div v-if="class_name==class_n" @click="doChoice('')" style="font-weight: bold;color: #009bff">
              {{ class_n }}
            </div>
            <div v-else @click="doChoice(class_n)">
              {{ class_n }}
            </div>
          </div>
        </div>
      </div>
      <div style="width: 100%;min-height: 1px;background: #e6e7ec">

      </div>
      <div style="display: flex;flex-direction: column;height: 50%;overflow-x: hidden">
        <div style="font-size: 1.2rem;font-weight: bold;padding: 5px 5px 0 5px">
          标签选择
        </div>
        <div style="overflow-y: auto;">
          <div v-for="(tag , index) in tags" :key="index" class="choice_class">
            <div v-if="search_value==tag" @click="postSearch('')" style="font-weight: bold;color: #009bff">
              {{ tag }}
            </div>
            <div v-else @click="postSearch(tag)">
              {{ tag }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.choice_class {
  padding: 5px 10px;
  cursor: pointer;
}

.right_items {
  height: calc(100% - 54px);
  width: 100%;
  margin: 10px 0;
  border-radius: 10px;
  background: white;
  border: 1px solid #e6e7ec;
}

.right_list {
  display: flex;
  flex-direction: column;
  width: 28%;
  margin-top: calc(12px + 54px);
  margin-bottom: 10px;
  max-height: calc(100% - 20px);
}

.page_select {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  width: 88px;
  font-weight: bold;
}

.page_select:focus {
  color: #009bff
}

.page_select:hover {
  color: #009bff
}

#search_button {
  font-size: 16px;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  border: transparent;
}

#search_button:hover,
#search_button:focus {
  outline: none;
  box-shadow: 0 0 8px #bbe6ff;
  border: none;
}

#search_input {
  width: 10rem;
  min-width: 4rem;
  font-size: 16px;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  margin-right: 0.2rem;
  background: transparent;
  border: #e5e5e5 solid 1px;
}

#search_input:hover,
#search_input:focus {
  outline: none;
  border: #1a98ee solid 1px;
}

.tab_note_title {
  font-size: 17px;
  color: #222323;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.small_title {
  font-size: 12px;
  color: #777b80
}

.tab_note {
  cursor: pointer;
  padding: 28px 20px;
  margin: 8px 8px;
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
  margin-bottom: 20px;
  color: #1c1c1c;
}

#main_tab_notes_view {
  display: flex;
  flex-direction: column;
  background-color: transparent;
  width: 96%;
  height: 100%;
  padding: 0 2%;
  overflow: auto;
}

#main_tab_notes_view::-webkit-scrollbar {
  display: none;
  background-color: transparent;
}

</style>