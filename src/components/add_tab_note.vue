<script setup lang="ts">
import Icon_to_home from "./weight/icon_to_home.vue";
import {Ref, ref} from "vue";
import axios from "axios";
import {getAddress} from "../operation/address.ts";
import {getLocalData} from "../operation/dataOperation.ts";
import router from "../router";
const title = ref("")
const class_name = ref("")
const tags = ref("")
const content = ref("")
const showText = ref("")

const classes:Ref<[]> = ref([])

getClasses()

async function getClasses(){
  const axiosResponse = await axios.get(getAddress() + "/getClasses")
  if (axiosResponse.data.response == "success") {
    classes.value = axiosResponse.data.classes
  }else {
    console.log(axiosResponse.data.response)
  }
}

async function insertTabNote(){
  if(title.value==""||class_name.value==""||content.value==""||title.value==" "||class_name.value==" "||content.value==" "){
    showText.value="标题，分类，内容是必填项"
    return
  }
  const axiosResponse = await axios.post(getAddress() + "/tab_note_add", {
    id: getLocalData("id"),
    token: getLocalData("token"),
    class_name:class_name.value,
    tab_note: content.value,
    tab_note_name:title.value,
    tags: tags.value,
  })
  if (axiosResponse.data.response == "success") {
    showText.value="成功"
    await router.push("/")
  }else if(axiosResponse.data.response == "token_check_failed") {
    showText.value="登录凭证验证失效"
  }else if(axiosResponse.data.response == "failed") {
    showText.value="服务器操作失败"
  }
}

</script>

<template>
  <div id="background">
    <icon_to_home/>
    <div id="items">
      <h1 style="font-size: 38px">
        创建您的贴文
      </h1>
      标题
      <input v-model="title">
      分类:{{class_name}}
      <div style="display: flex;flex-direction: row;margin-bottom: 10px;overflow-y: auto;align-items: center">
        <button @click="class_name=className"  v-for="className in classes" style="color: #1c1c1c;background: #ebebeb;margin-right: 10px;white-space: nowrap">
          {{className}}
        </button>
      </div>
      标签（可选）
      <input v-model="tags">
      附件（功能维护中）
      <input type="file">
      内容
      <textarea v-model="content">

        </textarea>
      <div style="display: flex; flex-direction: row;align-items: center;margin-top: 15px;margin-bottom: 100px">
        <button id="submit" @click="insertTabNote">
          提交
        </button>
        {{showText}}
      </div>
    </div>
  </div>
</template>

<style scoped>
input {
  margin-bottom: 8px;
}

#submit {
  margin-right: 10px;
  width: fit-content;
  padding: 12px 45px;
  background: #646cff;
}

textarea {
  width: auto;
  height: 1200px;
}

#items {
  display: flex;
  flex-direction: column;
  padding: 10px 15%;
  width: 70%;
}

#background {
  position: absolute;
  background: #ffffff;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
</style>