<script setup lang="ts" xmlns="http://www.w3.org/1999/html">

import {Ref, ref} from "vue";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";
import {delay,  getLocalData} from "../../operation/dataOperation.ts";

const plans: Ref<{}[]> = ref([])
const title_icon_name = ref("<-收起");
const todo_width = ref(260)
const new_plan = ref(false)
const new_plan_div = ref(true)
const new_content = ref("")
const new_link = ref("")
const new_date = ref(new Date().toISOString().substr(0, 10))
const add_button = ref("添加此计划")
const edit_button = ref("保存内容")
const delete_button = ref("删除这个计划")
const edit_plan_id = ref("")
const edit_content = ref("")
const edit_link = ref("")
const edit_date = ref("")

function handleResize(): void {
  if (todo_width.value > 50) {
    new_plan.value = false
    todo_width.value = 50
    const todo_plans = document.getElementById("todo-plans")
    if (todo_plans !== null) {
      title_icon_name.value = ">"
      todo_plans.style.width = todo_width.value + "px"
      todo_plans.style.minWidth = todo_width.value + "px"
    }
  } else {
    todo_width.value = 280
    new_plan.value = false
    const todo_plans = document.getElementById("todo-plans")
    if (todo_plans !== null) {
      title_icon_name.value = "<-收起"
      todo_plans.style.width = todo_width.value + "px"
      todo_plans.style.minWidth = todo_width.value + "px"
    }
  }
}

//默认调用
getAllPlans()

async function getAllPlans() {
  if (getLocalData("token") == "" || getLocalData("id") == "") {
    plans.value.push({content: "登录使用此功能", link: "", date: "", plan_id: ""})
  } else {
    const axiosResponse = await axios.post(getAddress() + "/get_plans", {
      id: getLocalData("id"),
      token: getLocalData("token")
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
  const axiosResponse = await axios.post(getAddress() + "/finish_plan_web", {
    id: getLocalData("id"),
    token: getLocalData("token"),
    plan_id: plan_id,
    content: content,
    link: link,
    date: date,
  })
  console.log(axiosResponse.data)
  await getAllPlans()
}

function newPlan() {
  const np = document.getElementById("add_plan")
  if (np != null) {
    new_plan.value = true
    np.style.width = "255px";
    np.style.height = "300px";
    np.style.top = "calc(100% - 340px)";
    np.style.cursor = "auto"
    np.style.padding = "10px"
    np.style.background = "#ffffff"
  }
}

async function closeNewPlan() {
  const np = document.getElementById("add_plan")
  if (np != null) {
    new_plan.value = false
    new_plan_div.value = false
    await delay(100)
    new_plan_div.value = true
    np.style.width = "fit-content";
    np.style.height = "fit-content";
    np.style.top = "calc(100% - 58px)";
    np.style.cursor = "pointer"
    np.style.padding = "13px 15px"
    np.style.background = "linear-gradient(45deg, #f5c1ff, #a5f1ff)"
  }
}

async function insertNewPlan() {
  if (new_content.value == "" || new_content.value == " " || new_date.value == "") {
    alert("请添加内容")
  } else {
    add_button.value = "正在发送"
    const axiosResponse = await axios.post(getAddress() + "/add_plan_web", {
      id: getLocalData("id"),
      token: getLocalData("token"),
      content: new_content.value,
      link: new_link.value,
      date: new_date.value,
    })
    if (axiosResponse.data.response == "success") {
      add_button.value = "发送成功"
      await getAllPlans()
      new_link.value=""
      new_content.value=""
      new_date.value= new Date().toISOString().substr(0, 10)
      await closeNewPlan()
      add_button.value = "添加此计划"
    } else {
      add_button.value = "提交失败"
      await delay(1000)
      add_button.value = "添加此计划"
    }
  }
}
async function deletePlan() {
    delete_button.value = "正在发送"
    const axiosResponse = await axios.post(getAddress() + "/delete_plan", {
      plan_id:edit_plan_id.value,
      id: getLocalData("id"),
      token: getLocalData("token"),
    })
    if (axiosResponse.data.response == "success") {
      delete_button.value = "发送成功"
      await getAllPlans()
      edit_plan_id.value=""
      edit_link.value=""
      edit_content.value=""
      edit_date.value=""
      delete_button.value = "删除这个计划"
    } else {
      delete_button.value = "提交失败"
      await delay(1000)
      delete_button.value = "删除这个计划"
    }
}
async function updatePlan() {
  if (edit_content.value == "" || edit_content.value == " " || edit_date.value == "") {
    alert("请添加内容")
  } else {
    edit_button.value = "正在发送"
    const axiosResponse = await axios.post(getAddress() + "/change_plan", {
      plan_id:edit_plan_id.value,
      id: getLocalData("id"),
      token: getLocalData("token"),
      content: edit_content.value,
      link: edit_link.value,
      date: edit_date.value,
    })
    if (axiosResponse.data.response == "success") {
      edit_button.value = "发送成功"
      await getAllPlans()
      edit_plan_id.value=""
      edit_link.value=""
      edit_content.value=""
      edit_date.value=""
      edit_button.value = "保存内容"
    } else {
      edit_button.value = "提交失败"
      await delay(1000)
      edit_button.value = "保存内容"
    }
  }
}
function openNewWindow(s:string) {
  window.open(s)
}
</script>

<template>
  <div id="new_plan_background" v-if="new_plan"></div>
<!--编辑界面-->
  <div id="edit_plan_content" v-if="edit_plan_id!=''&&todo_width>70">
    <div id="edit_plan">
      <div style="display: flex;flex-direction: column;justify-content: flex-start;">
        <div
            style="width: 100%;display: flex;flex-direction: row;justify-content: flex-end;margin-bottom: 10px;justify-items: center">
          <div style="width: 100%;font-size: 16px">
            变更这个计划
          </div>
          <button @click="edit_plan_id=''" style="cursor: pointer;color: #1a1a1a;padding: 0;height: 25px;">
            <img @click="edit_plan_id=''" src="../../assets/close.svg" style="">
          </button>
        </div>
        <div style="font-size: 12px;margin-left: 5px">
          计划内容
        </div>
        <textarea rows="3" style="width: auto;overflow: auto" v-model="edit_content">
        </textarea>
        <div style="font-size: 12px;margin-left: 5px">
          日期
        </div>
        <input class="date_picker" type="date" v-model="edit_date" value="">
        <div style="font-size: 12px;margin-left: 5px">
          链接（可选）
        </div>
        <input class="date_picker" type="text" v-model="edit_link">
        <button @click="updatePlan" style="background: #4495ff;margin-top: 10px;padding: 11px">
          {{ edit_button }}
        </button>
        <button @click="deletePlan" style="background: #1c1c1c;margin-top: 10px;padding: 11px">
          {{ delete_button }}
        </button>
      </div>
    </div>
  </div>

  <div id="todo-plans">
    <!--标题-->
    <div id="todo-title">
      <button @click="handleResize">
        {{ title_icon_name }}
      </button>
      <div v-if="todo_width>70">
        &nbsp;TabNote 计划
      </div>
    </div>

    <div v-if="plans.length==0&&todo_width>70" style="width: 100%; height: 100%;color: #797979 ;display: flex;flex-direction: column;justify-content: center;align-items: center;">
      请添加一项计划
    </div>

    <div id="items">
      <button @click="edit_plan_id=JSON.parse(JSON.stringify(plan)).plan_id;edit_content=JSON.parse(JSON.stringify(plan)).content;edit_date=JSON.parse(JSON.stringify(plan)).date;edit_link=JSON.parse(JSON.stringify(plan)).link" class="plans" v-if="todo_width>70"
              v-for="plan in plans" :key="JSON.parse(JSON.stringify(plan)).plan_id">
        <div style="display: flex;flex-direction: column;justify-content: flex-start;">
          <div style="overflow-wrap: break-word;text-align: left">
            {{ JSON.parse(JSON.stringify(plan)).content }}
          </div>
          <div style="display: flex;flex-direction: row;justify-content: flex-start;margin-top: 5px;">
            <div style="text-align: left;font-size: 12px">
              {{ JSON.parse(JSON.stringify(plan)).date }}
            </div>
            <div class="open_window" v-if=" JSON.parse(JSON.stringify(plan)).link!=''&& JSON.parse(JSON.stringify(plan)).link!=' '" @click.stop="openNewWindow(JSON.parse(JSON.stringify(plan)).link)" style="margin-left: 5px;text-align: left;font-size: 12px;color: #646cff">
              打开链接
            </div>
          </div>
        </div>
        <button
            @click="finishPlan(JSON.parse(JSON.stringify(plan)).plan_id,JSON.parse(JSON.stringify(plan)).content,JSON.parse(JSON.stringify(plan)).link,JSON.parse(JSON.stringify(plan)).date)"
            style="cursor: pointer;color: #1a1a1a;padding: 0;height: 25px;margin-left: auto">
          <img src="../../assets/check.svg" style="">
        </button>
      </button>
    </div>


    <div v-if="new_plan_div&&todo_width>70" @click="newPlan" id="add_plan">
      <div v-if="!new_plan">
        +&nbsp;添加计划
      </div>
      <div v-if="new_plan" style="display: flex;flex-direction: column;justify-content: flex-start">
        <div
            style="width: 100%;display: flex;flex-direction: row;justify-content: flex-end;margin-bottom: 10px;justify-items: center">
          <div style="width: 100%;font-size: 16px">
            添加一个计划
          </div>
          <button @click="closeNewPlan()" style="cursor: pointer;color: #1a1a1a;padding: 0;height: 25px;">
            <img @click="closeNewPlan()" src="../../assets/close.svg" style="">
          </button>
        </div>
        <div style="font-size: 12px;margin-left: 5px">
          计划内容
        </div>
        <textarea rows="3" style="width: auto;overflow: auto" v-model="new_content">
        </textarea>
        <div style="font-size: 12px;margin-left: 5px">
          日期
        </div>
        <input class="date_picker" type="date" v-model="new_date" value="">
        <div style="font-size: 12px;margin-left: 5px">
          链接（可选）
        </div>
        <input class="date_picker" type="text" v-model="new_link">
        <button @click="insertNewPlan" style="background: #4495ff;margin-top: 10px;padding: 11px">
          {{ add_button }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.open_window:hover{
  outline: 4px auto #646cff;
}
#new_plan_background {
  position: absolute;
  width: 300px;
  height: calc(100% - 54px);
  background: rgba(28, 28, 28, 0.5);
  z-index: 2;
}

#edit_plan_content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 300px;
  height: calc(100% - 54px);
  background: rgba(28, 28, 28, 0.5);
  z-index: 5;
  font-size: 14px;
}

#edit_plan {
  position: absolute;
  width: 255px;
  background: #ffffff;
  box-shadow: 1px 1px 8px #a6b7ff;
  padding: 10px;
  border-radius: 10px;
}

.date_picker {
  border: transparent;
  background: #f0f0f0;
}

#items {
  width: 100%;
  padding-bottom: 60px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.plans {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: #1c1c1c;
  margin-top: 10px;
  padding: 15px 12px;
}

#add_plan {
  border-radius: 8px;
  cursor: pointer;
  position: absolute;
  top: calc(100% - 58px);
  font-size: 14px;
  color: #1c1c1c;
  width: fit-content;
  z-index: 4;
  padding: 13px 20px;
  box-shadow: 1px 1px 8px #a6b7ff;
  background: linear-gradient(45deg, #f5c1ff, #a5f1ff);
  border: #ffffff;
}

#todo-plans {
  padding: 10px;
  background: #f5f5f5;
  height: calc(100% - 16px);
  width: 280px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

#todo-title {
  display: flex;
  flex-direction: row;
  color: #1a1a1a;
  align-items: center;
}

#todo-title button {
  background: #ffffff;
  color: #1a1a1a;
}
</style>