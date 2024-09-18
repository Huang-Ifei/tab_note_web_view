<script setup lang="ts">
import {ref} from "vue";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";
import {delay, getLocalData, getTokenData} from "../../operation/dataOperation.ts";

const props = defineProps(['id', 'editContent', 'editDate', 'editLink'])
const emit = defineEmits(['closeEdit', 'getAllPlans'])

const edit_button = ref("保存")
const delete_button = ref("删除")
const edit_content = ref(props.editContent)
const edit_link = ref(props.editLink)
const edit_date = ref(props.editDate)

async function deletePlan() {
  delete_button.value = "正在发送"
  const tk = await getTokenData()
  const axiosResponse = await axios.post(getAddress() + "/delete_plan", {
    plan_id: props.id,
    id: getLocalData("id"),
    token: tk,
  })
  if (axiosResponse.data.response == "success") {
    delete_button.value = "发送成功"
    emit('getAllPlans')
    emit('closeEdit')
    edit_link.value = ""
    edit_content.value = ""
    edit_date.value = ""
    delete_button.value = "删除"
  } else {
    delete_button.value = "提交失败"
    await delay(1000)
    delete_button.value = "删除"
  }
}

async function updatePlan() {
  if (edit_content.value == "" || edit_content.value == " " || edit_date.value == "") {
    alert("请添加内容")
  } else {
    edit_button.value = "正在发送"
    const tk = await getTokenData()
    const axiosResponse = await axios.post(getAddress() + "/change_plan", {
      plan_id: props.id,
      id: getLocalData("id"),
      token: tk,
      content: edit_content.value,
      link: edit_link.value,
      date: edit_date.value,
    })
    if (axiosResponse.data.response == "success") {
      edit_button.value = "发送成功"
      emit('getAllPlans')
      emit('closeEdit')
      edit_link.value = ""
      edit_content.value = ""
      edit_date.value = ""
      edit_button.value = "保存"
    } else {
      edit_button.value = "提交失败"
      await delay(1000)
      edit_button.value = "保存"
    }
  }
}

</script>

<template>
  <div class="small_add_todo_bg">
    <div
        style="display: flex;flex-direction: column;justify-content: flex-start;z-index: 120;background: white;padding:  15px 0.8rem 20px 0.8rem;margin: 4rem;border-radius: 10px;width: calc(100% - 4rem)">
      <div style="display: flex;flex-direction: column;justify-content: flex-start;">
        <div
            style="width: 100%;display: flex;flex-direction: row;justify-content: flex-end;margin-bottom: 10px;justify-items: center">
          <div style="width: 100%;font-size: 1.2rem">
            变更这项计划/待办
          </div>
          <button @click="emit('closeEdit')"
                  style="cursor: pointer;color: #1a1a1a;background: transparent;padding: 0;height: 25px;">
            <img @click="emit('closeEdit')" src="../../assets/close.svg" style="">
          </button>
        </div>
        <div style="font-size: 0.9rem;margin-left: 5px">
          内容
        </div>
        <textarea rows="4" style="width: auto;overflow: auto;font-size: 17px"
                  v-model="edit_content">
        </textarea>
        <div style="font-size: 0.9rem;margin-left: 5px">
          日期
        </div>
        <input class="date_picker" type="date" style="font-size: 17px" v-model="edit_date" value="">
        <div style="font-size: 17px;margin-left: 5px">
          链接（可选）
        </div>
        <input class="date_picker" type="text" v-model="edit_link">
        <button @click="updatePlan" style="margin-top: 10px;padding: 12px;font-size: 17px;  border:transparent;">
          {{ edit_button }}
        </button>
        <button @click="deletePlan"
                style="background: linear-gradient(45deg, #1e1e1e, #313131) ;margin-top: 10px;padding: 12px;font-size: 17px;  border:transparent;">
          {{ delete_button }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.small_add_todo_bg {
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  color: #1c1c1c;
  width: 100%;
  height: 100%;
  border-radius: 0;
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
  font-size: 17px;
  padding: 10px 12px;
  font-weight: normal;
}

.date_picker:hover,
.date_picker:focus {
  box-shadow: none;
}

#edit_plan {
  position: absolute;
  width: 255px;
  background: #ffffff;
  box-shadow: none;
  padding: 10px;
  border-radius: 7px;
  border: transparent;
}

#edit_plan:hover {
  box-shadow: 0 0 8px #98daff;
}

button:hover {
  border: #1c99ee solid 1px;
}

#todo-title button {
  background: #ffffff;
  color: #1a1a1a;
}
</style>