<script setup lang="ts">
import axios from "axios";
import {getAddress} from "../../operation/address.ts";
import {delay, getLocalData, getTokenData} from "../../operation/dataOperation.ts";
import {ref} from "vue";

const new_content = ref("")
const new_link = ref("")
const new_date = ref(new Date().toISOString().substr(0, 10))
const add_button = ref("添加")

const emit = defineEmits(['getAllPlans', 'closeAdd'])

async function insertNewPlan() {
  if (new_content.value == "" || new_content.value == " " || new_date.value == "") {
    alert("请添加内容")
  } else {
    add_button.value = "正在发送"
    const tk = await getTokenData()
    const axiosResponse = await axios.post(getAddress() + "/add_plan_web", {
      id: getLocalData("id"),
      token: tk,
      content: new_content.value,
      link: new_link.value,
      date: new_date.value,
    })
    if (axiosResponse.data.response == "success") {
      add_button.value = "发送成功"
      emit("getAllPlans")
      new_link.value = ""
      new_content.value = ""
      new_date.value = new Date().toISOString().substr(0, 10)
      emit("closeAdd")
      add_button.value = "添加"
    } else {
      add_button.value = "提交失败"
      await delay(1000)
      add_button.value = "添加"
    }
  }
}
</script>

<template>
  <div class="add_todo_bg">
    <div
        style="display: flex;flex-direction: column;justify-content: flex-start;z-index: 120;background: white;padding:  15px 0.8rem 20px 0.8rem;margin: 3rem;border-radius: 6px;width: calc(100% - 3rem)">
      <div
          style="width: 100%;display: flex;flex-direction: row;justify-content: flex-end;margin-bottom: 10px;justify-items: center">
        <div style="width: 100%;font-size: 1rem">
          添加一项计划/待办
        </div>
        <button @click="emit('closeAdd')"
                style="cursor: pointer;color: #1a1a1a;background: transparent;padding: 0;height: 25px;">
          <img src="../../assets/close.svg" style="left: auto">
        </button>
      </div>
      <div style="font-size: 12px;margin-left: 5px">
        内容
      </div>
      <textarea rows="3" style="width: auto;overflow: auto" v-model="new_content">
        </textarea>
      <div style="font-size: 12px;margin-left: 5px">
        日期
      </div>
      <input class="date_picker" type="date" v-model="new_date">
      <div style="font-size: 12px;margin-left: 5px">
        链接（可选）
      </div>
      <input class="date_picker" type="text" v-model="new_link">
      <button @click="insertNewPlan" style="margin-top: 10px;padding: 12px;font-size: 0.9rem; border:transparent;">
        {{ add_button }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.add_todo_bg {
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  color: #1c1c1c;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0
}

.date_picker {
  background: #f4f5f6;
  border: transparent;
}

.date_picker:hover,
.date_picker:focus {
  box-shadow: none;
}

button:hover {
  border: #1c99ee solid 1px;
}

#todo-title button {
  background: #ffffff;
  color: #1a1a1a;
}
</style>