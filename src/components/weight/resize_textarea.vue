<script setup lang="ts">
import {ref, watch} from "vue";
import Compressor from "compressorjs";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";

//父组件传入的function、数据等内容
const props = defineProps(['smallScreen','modelChoice'])
//父组件传入的事件
const emit = defineEmits(['doSend', 'addPicture','setModel'])
const content = defineModel({default:""});

const resizeText = ref(1)


function changeSize() {
  resizeText.value = content.value.split('\n').length
}

function send() {
  if (content.value != "") {
    emit('doSend', content.value)
    content.value = "";
    resizeText.value = 1
  }
}

const imageSrc = ref("")

function clickInputImg() {
  document?.getElementById('add_new')?.click()
}

async function handleFileChange(event: Event) {
  //事件的目标作为HTML输入组件
  const target = event.target as HTMLInputElement;
  //输入组件的第0个文件
  const file: File | null = (target.files && target.files[0]) || null;

  if (file) {
    try {
      //压缩文件
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
        convertSize: 100000,
        mimeType: 'image/jpeg',
        success(result) {//成功执行：reader读取内容到imageSrc中（base64编码）
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result as string;
            imageSrc.value = base64String;
            console.log(base64String);
            insertTabNoteImg(base64String);
          };
          reader.readAsDataURL(result instanceof Blob ? result : new Blob([result]));
        },
        error(error) {
          console.error('Compression error:', error.message);
        },
      });
    } catch (e) {
      console.error(e)
    }
  } else {
    // 如果没有选择文件，重置图片 URL
    imageSrc.value = "";
  }
}

async function insertTabNoteImg(s: string) {
  console.log({img: s})
  const axiosResponse = await axios.post(getAddress() + "/insertTabNoteImg", {img: s})
  if (axiosResponse.data !== "failed") {
    let img = axiosResponse.data
    console.log(img)
    emit('addPicture', img)

  } else {
    console.log("failed")
    alert("图片上传出错")
  }
}

function setModel(s:string) {
  emit('setModel',s)
}


watch(
    () => content.value,
    (newContent) => {
      content.value = newContent || "";
      resizeText.value = content.value.split('\n').length;
    }
);
</script>

<template>
  <div class="text_area_bg" v-if="!props.smallScreen">
    <button id="add" @click="clickInputImg">
      <input id="add_new" type="file" accept="image/*" @change="handleFileChange"/>
      <img alt="相机" src="../../assets/camera.svg"/>
    </button>
    <img style="height: 40px;padding:10px 0" alt="4o" @click="setModel('gpt-4o-mini')" v-if="props.modelChoice=='gpt-4o'"  src="../../assets/4o.svg"/>
    <img style="height: 40px;padding:10px 0" alt="mini" @click="setModel('gpt-4o')" v-if="props.modelChoice=='gpt-4o-mini'" src="../../assets/min.svg"/>
    <textarea id="textareaEl" v-model="content" @input="changeSize" :rows="resizeText"/>
    <button @click="send">
      发送
    </button>
  </div>
  <div class="text_area_bg" v-else-if="props.smallScreen" style="width: 100%;padding-left: 10px;padding-right: 10px">
    <button id="add" @click="clickInputImg">
      <input id="add_new" type="file" accept="image/*" @change="handleFileChange"/>
      <img alt="相机" src="../../assets/camera.svg"/>
    </button>
    <img style="height: 40px;padding:10px 0" alt="4o" @click="setModel('gpt-4o-mini')" v-if="props.modelChoice=='gpt-4o'"  src="../../assets/4o.svg"/>
    <img style="height: 40px;padding:10px 0" alt="mini" @click="setModel('gpt-4o')" v-if="props.modelChoice=='gpt-4o-mini'" src="../../assets/min.svg"/>
    <textarea id="textareaEl" style="width: calc(100% - 130px);" v-model="content" @input="changeSize"
              :rows="resizeText"/>
    <button @click="send" style="width: 55px;padding: 0">
      <img alt="发送" style="width: 25px;margin: 0;padding: 4px 0 0;" src="../../assets/send.svg"/>
    </button>
  </div>
</template>

<style scoped>
#add {
  border: none;
  background: rgba(245, 245, 245, 0.8);
  color: #545454;
  z-index: 5;
  padding: 12px 12px;
  width: fit-content;
}

#add:hover {
  outline: none;
  color: #1a98ee;
  border: none;
  box-shadow: none;
}

#add:focus {
  outline: none;
  color: #1a98ee;
  border: none;
  box-shadow: none;
}

#add_new {
  position: absolute;
  color: transparent;
  background: rgba(26, 152, 238, 0.5);
  padding: 0;
  border: transparent;
  cursor: pointer;
  box-shadow: none;
  display: none;
}

.text_area_bg {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: row;
  align-items: end;
  width: 80%;
  padding-left: 10%;
  padding-right: 10%;
  pointer-events: visible
}

#textareaEl {
  border: rgb(206, 206, 206) 1px solid;
  background: rgb(255, 255, 255);
  width: calc(100% - 155px);
  resize: none;
  min-height: calc(45px - 20px);
  margin: 8px 5px 8px 0;
  padding: 8px 10px;
  font-size: 16px;
  overflow: auto;
  max-height: 300px;
}

#textareaEl:hover,
#textareaEl:focus,
#textareaEl:focus-visible {
  border: #1c99ee solid 1px;
  box-shadow: none;
}

button {
  height: 46px;
  width: 120px;
  padding: 8px 5px;
  margin: 8px 0 7px 0;
  border-radius: 10px;
  border: none;
}

button:hover {
  box-shadow: 0 0 8px #bbe6ff;
  border: none;
  outline: none;
}

::-webkit-scrollbar {
  width: 7px;
  height: 7px;
  background-color: transparent;
  border: none;
  outline: none;
}

::-webkit-scrollbar-thumb {
  background-color: #8a8a8a;
  border-radius: 10px;
  border: none;
  outline: none;
  cursor: pointer;
}
</style>