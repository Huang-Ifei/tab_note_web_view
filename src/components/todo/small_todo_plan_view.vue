<script setup lang="ts">

import {Ref, ref} from "vue";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";
import {escapeHTMLWithOutConsole, getLocalData, getTokenData} from "../../operation/dataOperation.ts";
import Small_add_todo from "./small_add_todo.vue";
import Small_edit_todo from "./small_edit_todo.vue";

const plans: Ref<{}[]> = ref([])
const todo_width = ref(260)
const new_plan = ref(false)
const edit_plan_id = ref("")
const edit_content = ref("")
const edit_link = ref("")
const edit_date = ref("")

const emit = defineEmits(['doClose'])

//默认调用
getAllPlans()

async function getAllPlans() {
  if (getLocalData("id") == "") {
    plans.value.push({content: "登录使用此功能", link: "", date: "", plan_id: ""})
  } else {
    const tk = await getTokenData();
    const axiosResponse = await axios.post(getAddress() + "/get_plans", {
      id: getLocalData("id"),
      token: tk
    })
    console.log(axiosResponse.data)
    if (axiosResponse.data.response == "success") {
      try {
        console.log(axiosResponse.data.plans)
        plans.value = axiosResponse.data.plans
      } catch (e) {
        console.error(e)
      }
    } else if (axiosResponse.data.response == "token_check_failed") {
      plans.value.push({content: "token已失效，请重新登录", link: "", date: "", plan_id: ""})
    } else if (axiosResponse.data.response == "failed") {
      plans.value.push({content: "服务器响应失败", link: "", date: "", plan_id: ""})
    } else {

    }
  }
}

async function finishPlan(plan_id: string, content: string, link: string, date: string) {
  const tk = await getTokenData()
  const axiosResponse = await axios.post(getAddress() + "/finish_plan_web", {
    id: getLocalData("id"),
    token: tk,
    plan_id: plan_id,
    content: content,
    link: link,
    date: date,
  })
  console.log(axiosResponse.data)
  await getAllPlans()
}

function openNewWindow(s: string) {
  window.open(s)
}

</script>

<template>
  <div class="small_todo_background">

    <div id="todo-plans">
      <!--标题-->
      <div class="todo-title">
        计划/待办
        <button @click="emit('doClose')" class="close_button" style="width: 30px;height: 30px">
          <img src="../../assets/close.svg" @click="emit('doClose',false)" style="width: 30px;height: 30px" />
        </button>
      </div>
    </div>

    <div style="overflow: auto;padding-bottom: 80px;">
      <button
          @click="edit_plan_id=JSON.parse(JSON.stringify(plan)).plan_id;edit_content=JSON.parse(JSON.stringify(plan)).content;edit_date=JSON.parse(JSON.stringify(plan)).date;edit_link=JSON.parse(JSON.stringify(plan)).link"
          class="plans" v-if="todo_width>70"
          v-for="plan in plans" :key="JSON.parse(JSON.stringify(plan)).plan_id">
        <div style="display: flex;flex-direction: column;justify-content: flex-start;">
          <div style="overflow-wrap: break-word;text-align: left;font-size: 17px;font-weight: normal" v-html="escapeHTMLWithOutConsole(JSON.parse(JSON.stringify(plan)).content)">
          </div>
          <div style="display: flex;flex-direction: row;justify-content: flex-start;margin-top: 5px;">
            <div style="text-align: left;font-size: 13px;color: #777b80">
              {{ JSON.parse(JSON.stringify(plan)).date }}
            </div>
            <div class="open_window"
                 v-if=" JSON.parse(JSON.stringify(plan)).link!=''&& JSON.parse(JSON.stringify(plan)).link!=' '"
                 @click.stop="openNewWindow(JSON.parse(JSON.stringify(plan)).link)"
                 style="margin-left: 5px;text-align: left;font-size: 13px;color: #1a98ee">
              打开链接
            </div>
          </div>
        </div>
        <button
            @click.stop="finishPlan(JSON.parse(JSON.stringify(plan)).plan_id,JSON.parse(JSON.stringify(plan)).content,JSON.parse(JSON.stringify(plan)).link,JSON.parse(JSON.stringify(plan)).date)"
            class="check_icon">
          <img src="../../assets/check.svg" style="height: 2rem;width: 2rem;">
        </button>
      </button>
    </div>
    <div
        v-if="plans.length==0"
        style="width: 100%; height: 100%;color: #797979 ;display: flex;flex-direction: column;justify-content: center;align-items: center;position: absolute;font-size: 1.1rem">
      请添加一项计划/待办
    </div>

    <button v-if="!new_plan" class="add_button" @click="new_plan=true">
      添加一项
    </button>

    <transition name="add">
      <small_add_todo v-if="new_plan" @closeAdd="new_plan=false" @getAllPlans="getAllPlans"/>
    </transition>


    <transition name="edit">
      <small_edit_todo v-if="edit_plan_id!=''" :id="edit_plan_id" :edit-content="edit_content" :edit-date="edit_date"
                      :edit-link="edit_link" @getAllPlans="getAllPlans" @closeEdit="edit_plan_id=''" />
    </transition>
  </div>
</template>

<style scoped>
.add-enter-active,
.add-leave-active {
  transition: opacity 0.25s ease;
}

.add-enter-from,
.add-leave-to {
  opacity: 0;
}

.edit-enter-active,
.edit-leave-active {
  transition: opacity 0.25s ease;
}

.edit-enter-from,
.edit-leave-to {
  opacity: 0;
}

.close_button {
  cursor: pointer;
  background: transparent;
  padding: 0;
  height: 24px;
  left: auto;
  border: none;
  justify-content: right;
  margin-left: auto;
  display: flex;
}

button:hover,
button:focus {
  outline: none;
  border: transparent 1px solid;
  box-shadow: none;
}

.plans {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #1c1c1c;
  width: calc(100% - 2rem);
  margin-bottom: 0.7rem;
  margin-right: 1rem;
  margin-left: 1rem;
  padding: 1.2rem 1rem;
  background: #ffffff;
}

.todo-title {
  font-weight: bold;
  font-size: 23px;
  padding: 12px 15px 8px 15px;
  display: flex;
  align-items: center;
}

.open_window:hover {
  text-shadow: #b0ddff 0 0 8px;
}

.check_icon {
  cursor: pointer;
  color: #1a1a1a;
  padding: 0;
  min-height: 2rem;
  width: 2rem;
  min-width: 2rem;
  height: 2rem;
  margin-left: auto;
  background: transparent;
}

.check_icon:hover {
  box-shadow: none;
}

.add_button {
  font-weight: normal;
  font-size: 1.1rem;
  border-radius: 10px;
  position: absolute;
  padding: 1rem 1.6rem;
  top: calc(100% - 4.5rem);
  left: calc(100% - 8.7rem);
  border: none;
}

.small_todo_background {
  width: 100%;
  height: calc( 100% - 54px);
  position: absolute;
  box-shadow: 0 0 8px #bebebe;
  background-color: rgba(244, 245, 246, 0.9);
  backdrop-filter: blur(20px);
  margin-top: 54px;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  pointer-events: visible;
}

</style>