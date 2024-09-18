<script setup lang="ts">
import {ref, watch} from "vue";

//父组件传入的function、数据等内容
const props = defineProps(['smallScreen'])
//父组件传入的事件
const emit = defineEmits(['doSend'])

const content = defineModel({default: ""});
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
    <textarea id="textareaEl" v-model="content" @input="changeSize" :rows="resizeText"/>
    <button @click="send">
      发送
    </button>
  </div>
  <div class="text_area_bg" v-else-if="props.smallScreen" style="width: 100%;padding-left: 10px;padding-right: 10px">
    <textarea id="textareaEl" style="width: calc(100% - 100px);" v-model="content" @input="changeSize" :rows="resizeText"/>
    <button @click="send" style="width: 80px">
      发送
    </button>
  </div>
</template>

<style scoped>
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
  margin: 8px 5px;
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