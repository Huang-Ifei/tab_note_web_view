<script setup lang="ts">
import Icon_to_home from "../weight/icon_to_home.vue";
import {Ref, ref} from "vue";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";
import {escapeTabNoteToHTML, getLocalData} from "../../operation/dataOperation.ts";
import router from "../../router";
import Classes_bar from "../weight/classes_bar.vue";
import Choice_pic from "../weight/choice_pic.vue";


const title = ref("")
const class_name = ref("")
const tags = ref("")
const content = ref("")
const showText = ref("")
const pics: Ref<string[]> = ref([])
const inputOrPreview = ref(false)
const base64File = ref("")

function doSelect(s: string) {
  pics.value.push(s)
  content.value += "{[#pic]}"
}

function doDelete(s: string) {
  for (let i = 0; i < pics.value.length; i++) {
    if (pics.value[i] === s) {
      pics.value.splice(i, 1);
      let count =0;
      let newContent = ""
      for(let j=0;j<content.value.length; j++) {
        if (content.value.substring(j,j+8) === "{[#pic]}") {
          if (count!=i){
            newContent+=content.value[j]
          }else{
            j=j+7
          }
          count++
        }else{
          newContent+=content.value[j]
        }
      }
      content.value = newContent
      break;
    }
  }
}

async function insertTabNote() {
  if (title.value == "" || class_name.value == "" || content.value == "" || title.value == " " || class_name.value == " " || content.value == " ") {
    alert("标题，分类，内容是必填项")
    return
  }
  if (tags.value != "" && !tags.value.startsWith("#")) {
    alert("每个标签应当以#号开头")
    return
  }
  const axiosResponse = await axios.post(getAddress() + "/tab_note_add", {
    id: getLocalData("id"),
    token: getLocalData("token"),
    class_name: class_name.value,
    tab_note: content.value,
    tab_note_name: title.value,
    tags: tags.value,
    pics: pics.value,
    file:base64File.value
  })
  if (axiosResponse.data.response == "success") {
    showText.value = "成功"
    await router.push("/")
  } else if (axiosResponse.data.response == "token_check_failed") {
    alert("登录凭证验证失效")
  } else if (axiosResponse.data.response == "failed") {
    alert("服务器操作失败")
  }
}

async function watch_manual() {
  window.open("/tab_manual")
}

function doChoice(s: string) {
  class_name.value = s;
}

function handleFileChange(event: Event) {
  //事件的目标作为HTML输入组件
  const target = event.target as HTMLInputElement;
  //输入组件的第0个文件
  const file: File | null = (target.files && target.files[0]) || null;

  if (file) {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result!=null&&reader.result.toString().length<5*1024*1024){
          base64File.value=reader.result.toString()
          if (!base64File.value.startsWith("data:application/x-zip-compressed;base64,")){
            base64File.value=""
            alert("文件格式错误,将不会被上传")
          }
          console.log(base64File.value);
        }else {
          alert("文件超出5mb限制,将不会被上传")
          base64File.value=""
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e)
    }
  } else {
    alert("没有这个文件")
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
      分类:{{ class_name }}
      <classes_bar :class_name="class_name" @doChoice="doChoice"/>
      标签（可选）：
      <input v-model="tags" class="tags_input" type="text" placeholder="标签">
      附件（alpha公测版，仅支持.zip格式，小于5mb）：
      <input type="file" class="file_input" accept="application/zip" @change="handleFileChange">
      <choice_pic :pics="pics" @doSelect="doSelect" @doDelete="doDelete"/>
      <div>内容：<a @click="watch_manual"
                   style="display: inline-block;cursor: pointer">(点击查看贴文特殊字符及图片插入手册)</a></div>
      <textarea v-model="content" v-if="!inputOrPreview">

        </textarea>

      <div v-if="inputOrPreview" v-html="escapeTabNoteToHTML(content,pics)">

      </div>

      <div style="display: flex; flex-direction: row;align-items: center;margin-top: 15px;margin-bottom: 100px">
        <button id="submit" @click="insertTabNote">
          提交
        </button>
        <a id="display" @click="inputOrPreview=!inputOrPreview">
          预览
        </a>
        {{ showText }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab_note_title {
  width: 70%;
  min-width: 300px;
  padding: 10px;
  font-size: 22px;
  font-weight: bold;
  color: #213547;
}

.tags_input {
  width: 70%;
  min-width: 300px;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #0990e9;
}

.file_input {
  width: fit-content;
  max-width: 70%;
}

input {
  margin-bottom: 8px;
}

#display {
  margin-right: 10px;
  padding: 12px 20px;
  cursor: pointer;
}

#submit {
  margin-right: 10px;
  width: fit-content;
  padding: 12px 45px;
  color: rgba(255, 255, 255, 0.9);
  border: transparent;
  background: linear-gradient(45deg, #1c99ee, #67c1ff);
  box-shadow: #85cfff 0 0 8px;
}

#submit:hover,
#submit:focus {
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
  width: calc(100% - 60px);
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