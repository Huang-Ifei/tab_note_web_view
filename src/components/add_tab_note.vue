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
    alert("标题，分类，内容是必填项")
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
    alert("登录凭证验证失效")
  }else if(axiosResponse.data.response == "failed") {
    alert("服务器操作失败")
  }
}

</script>

<template>
  <div id="background">
    <icon_to_home/>
    <div id="items">
      <h1 style="font-size: 30px">
        创建您的贴文
      </h1>
      标题：
      <input v-model="title" class="tab_note_title" type="text" placeholder="贴文标题">
      分类:{{class_name}}
      <div style="display: flex;flex-direction: row;margin-bottom: 10px;overflow-y: auto;align-items: center">
        <div  v-for="className in classes">
          <button v-if="className!=class_name" @click="class_name=className" class="class_choice">
            {{className}}
          </button>
          <button v-if="className==class_name" @click="class_name=className"  class="class_choiced">
            {{className}}
          </button>
        </div>
      </div>
      标签（可选）：
      <input v-model="tags" class="tags_input" type="text" placeholder="标签">
      附件（功能维护中）：
      <input type="file" class="file_input">
      <div>内容：<a href="/manual" style="display: inline-block;cursor: pointer">(点击查看贴文特殊字符手册)</a></div>
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
.tab_note_title{
  width: 70%;
  min-width: 300px;
  padding: 10px;
  font-size: 22px;
  font-weight: bold;
  color: #213547;
}
.class_choice{
  margin-right: 10px;
  border-radius: 50px;
  white-space: nowrap;
  background: white;
  border: 1px solid #dfdfdf;
  color: #1c1c1c;
  margin-top: 5px;
  margin-bottom: 5px;
}
.class_choiced{
  margin-right: 10px;
  border-radius: 50px;
  white-space: nowrap;
  background: white;
  border: 1px solid #1c99ee;
  color: #1c1c1c;
  margin-top: 5px;
  margin-bottom: 5px;
}
.tags_input{
  width: 70%;
  min-width: 300px;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #0990e9;
}
.file_input{
  width: fit-content;
}
input {
  margin-bottom: 8px;
}

#submit {
  margin-right: 10px;
  width: fit-content;
  padding: 12px 45px;
  color: rgba(255,255,255,0.9);
  border: transparent;
  background: linear-gradient(45deg, #1c99ee, #67c1ff);
  box-shadow: #85cfff 0 0 8px;
}
#submit:hover,
#submit:focus{
  outline: none;
}

textarea {
  width: auto;
  min-height: 500px;
  height: 500px;
}

#items {
  display: flex;
  flex-direction: column;
  padding: 10px 30px;
  width: calc(100% - 60px );
}

#background {
  position: absolute;
  background: #ffffff;
  width: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
</style>