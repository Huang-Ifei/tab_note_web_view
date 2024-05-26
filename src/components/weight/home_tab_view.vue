<script setup lang="ts">

import {Ref, ref} from "vue";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";
import router from "../../router";

const page_count = ref(0)
const page_size = ref(1)
const page_list: Ref<{}[]> = ref([])

getPageCount()
getTabNotePage()

async function getPageCount() {
  const axiosResponse = await axios.get(getAddress() + "/get_page_count");
  page_count.value = axiosResponse.data.pageCount
}

async function getTabNotePage() {
  const axiosResponse = await axios.get(getAddress() + "/tab_note_page?page=" + page_size.value);

  if (axiosResponse.data.response == "success") {
    try {
      page_list.value = axiosResponse.data.list;
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

function show_tab_note(tab_note_id:string) {
  router.push({path:"/tab_note_view",query:{tab_note_id:tab_note_id}})
}

</script>

<template>
  <div id="main_tab_notes_view">
    <h2>
      TabNote贴文
    </h2>
    <div id="page_tab_notes">

      <div v-if="page_list.length%2==0" class="tab_note_row" v-for="i in page_list.length/2">
        <div class="tab_note" @click="show_tab_note(JSON.parse(JSON.stringify(page_list[i * 2 - 2])).tab_note_id)">
          <div style="font-size: 18px;font-weight: bold">
            {{ JSON.parse(JSON.stringify(page_list[i * 2 - 2])).tab_note_name }}
          </div>
          <div style="font-size: 12px">
            作者：{{
              JSON.parse(JSON.stringify(page_list[i * 2 - 2])).usr_name
            }}&nbsp;&nbsp;&nbsp;&nbsp;{{ JSON.parse(JSON.stringify(page_list[i * 2 - 2])).date_time }}
          </div>
        </div>

        <div v-if="(i*2-1)<page_list.length" class="tab_note" @click="show_tab_note(JSON.parse(JSON.stringify(page_list[i * 2 - 1])).tab_note_id)">
          <div style="font-size: 18px;font-weight: bold">
            {{ JSON.parse(JSON.stringify(page_list[i * 2 - 1])).tab_note_name }}
          </div>
          <div style="font-size: 12px">
            作者：{{
              JSON.parse(JSON.stringify(page_list[i * 2 - 1])).usr_name
            }}&nbsp;&nbsp;&nbsp;&nbsp;{{ JSON.parse(JSON.stringify(page_list[i * 2 - 1])).date_time }}
          </div>
        </div>
      </div>

      <div v-if="page_list.length%2==1" class="tab_note_row" v-for="i in page_list.length/2+0.5">
        <div class="tab_note" style="width: 50%;" @click="show_tab_note(JSON.parse(JSON.stringify(page_list[i * 2 - 2])).tab_note_id)">
          <div style="font-size: 18px;font-weight: bold">
            {{ JSON.parse(JSON.stringify(page_list[i * 2 - 2])).tab_note_name }}
          </div>
          <div style="font-size: 12px">
            作者：{{
              JSON.parse(JSON.stringify(page_list[i * 2 - 2])).usr_name
            }}&nbsp;&nbsp;&nbsp;&nbsp;{{ JSON.parse(JSON.stringify(page_list[i * 2 - 2])).date_time }}
          </div>
        </div>

        <div v-if="(i*2-1)<page_list.length" class="tab_note" @click="show_tab_note(JSON.parse(JSON.stringify(page_list[i * 2 - 1])).tab_note_id)" style="width: 50%;">
          <div style="font-size: 18px;font-weight: bold">
            {{ JSON.parse(JSON.stringify(page_list[i * 2 - 1])).tab_note_name }}
          </div>
          <div style="font-size: 12px">
            作者：{{
              JSON.parse(JSON.stringify(page_list[i * 2 - 1])).usr_name
            }}&nbsp;&nbsp;&nbsp;&nbsp;{{ JSON.parse(JSON.stringify(page_list[i * 2 - 1])).date_time }}
          </div>
        </div>
      </div>

    </div>

    <div id="page_choice">
      <button style="background: #f5f5f5;margin-right: 10px" v-if="page_size>1" @click="page_size--;getTabNotePage()">
        上一页
      </button>
      第{{ page_size }}页/共{{ page_count }}页
      <button style="background: #f5f5f5;margin-left: 10px" v-if="page_size<page_count" @click="page_size++;getTabNotePage()">
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.tab_note_row {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.tab_note {
  cursor: pointer;
  width: calc(100% - 40px);
  padding: 30px 20px;
  margin: 10px;
  background: white;
  border-radius: 10px;
  outline:  1px auto #eaeaea;
  color: #1c1c1c;
  text-align: left;
}
.tab_note:hover {
  outline:  1px auto #646cff;
}

#page_choice {
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
  background-color: #ffffff;
  width: 90%;
  padding: 0 5%;
  height: 100%;
  overflow: auto;
}
</style>