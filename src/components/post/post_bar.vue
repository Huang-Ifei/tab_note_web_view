<script setup lang="ts">

import {Ref, ref} from "vue";
import {getAddress} from "../../operation/address.ts";
import Post_img from "./post_img.vue";

const props = defineProps(['smallScreen'])
const emit = defineEmits(['doSearch'])
type postJson = {
  post_id: string,
  post_picture: string,
  post_name: string,
  post_tag: string
}

const canChange = ref(true)
const post_num = ref(0)
const post_values: Ref<postJson[]> = ref([
  {
    post_id: "",
    post_picture: getAddress() + "/tabNoteImg?name=java_web_qm",
    post_name: "Java Web期末复习专栏",
    post_tag: "#JavaWeb期末复习"
  },
  {
    post_id: "",
    post_picture: getAddress() + "/tabNoteImg?name=java_web",
    post_name: "Java Web综合实验专栏",
    post_tag: "#JavaWeb信息管理系统"
  },
  {
    post_id: "",
    post_picture: getAddress() + "/tabNoteImg?name=sql",
    post_name: "数据库期末复习专栏",
    post_tag: "#数据库期末复习"
  },
])

getPosts()

function getPosts() {

}

setInterval(() => {
  if (canChange.value) {
    rightOne()
  }
}, 4000)

function leftOne() {
  if (post_num.value > 0) {
    post_num.value--
  } else {
    post_num.value = post_values.value.length - 1
  }
}

function rightOne() {
  if (post_num.value < post_values.value.length - 1) {
    post_num.value++
  } else {
    post_num.value = 0
  }
}
</script>

<template>
  <div style="display: flex;flex-direction: column;justify-content: center">
    <!--post-->
    <div
        style="width: 100%;display: flex;flex-direction: row;height: fit-content;justify-content: center;align-items: center"
        @mouseenter="canChange=false" @mouseleave="canChange=true">
      <img v-if="!props.smallScreen" alt="" @click.stop="leftOne" src="../../assets/arrow_back.svg"
           class="change_view_button_left">
      <div @click="emit('doSearch',post_values[post_num].post_tag)" class="post">
        <post_img :post_values="post_values" :post_num="post_num"/>
        <div style="padding: 10px 20px 20px 20px;position: relative">
          <div class="tab_note_title">
            {{ post_values[post_num].post_name }}
          </div>
          <div class="small_title">
            {{ post_values[post_num].post_tag }}
          </div>
        </div>
      </div>
      <img v-if="!props.smallScreen" @click="rightOne" src="../../assets/arrow_forward.svg"
           class="change_view_button_right">
    </div>

    <!--下面的小按钮-->
    <div
        style="width: 100%;padding-left: 5px;display: flex;flex-direction: row;height: fit-content;justify-content: center;align-items: center">
      <img v-if="props.smallScreen" alt="" @click.stop="leftOne" src="../../assets/arrow_back.svg"
           class="change_view_button_left" style="margin-right: calc(0.5rem + 30px)">
      <div v-for="(small_button,i) in post_values" :id="small_button.post_id">
        <div @click="post_num=i" v-if="i==post_num"
             style="background: #1a98ee;width: 0.5rem;height: 0.5rem;border-radius: 0.5rem;margin-right: 0.5rem;cursor: pointer;color: #1a98ee;">

        </div>
        <div @click="post_num=i" v-if="i!=post_num"
             style="background: #d7d7d7;width: 0.5rem;height: 0.5rem;border-radius: 0.5rem;cursor: pointer;margin-right: 0.5rem">

        </div>
      </div>
      <img v-if="props.smallScreen" @click="rightOne" src="../../assets/arrow_forward.svg"
           class="change_view_button_right" style="margin-left: 30px;margin-right: 5px">
    </div>
  </div>


</template>

<style scoped>
.change_view_button_left {
  top: 50%;
  padding: 5px 1px 5px 10px;
  height: 30px;
  cursor: pointer;
  background: white;
  border: #e5e5e5 solid 1px;
  border-radius: 50px;
}

.change_view_button_left:hover {
  border: #1a98ee solid 1px;
  outline: none;
}

.change_view_button_right {
  left: calc(100% - 82px);
  height: 30px;
  padding: 5px 5px 5px 7px;
  cursor: pointer;
  border: #e5e5e5 solid 1px;
  background: white;
  border-radius: 50px;
}

.change_view_button_right:hover {
  border: #1a98ee solid 1px;
  outline: none;
}

.post {
  width: 100%;
  margin: 5px 8px;
  border-radius: 10px;
  background: white;
  border: #e5e5e5 solid 1px;
  cursor: pointer;
  position: relative
}

.post:hover {
  border: #1a98ee solid 1px;
  box-shadow: 0 0 8px #c6e9ff;
  outline: none;
}

.tab_note_title {
  font-size: 18px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.small_title {
  font-size: 12px;
  color: #626771
}
</style>