<script setup lang="ts">
import {ref, watch} from "vue";

//父组件传入的function、数据等内容
const props = defineProps(['smallScreen'])
//父组件传入的事件
const emit = defineEmits(['doSend'])

const content = defineModel({default:""});
const resizeText = ref(1)

function changeSize() {
  resizeText.value = content.value.split('\n').length
}

function send() {
  if(content.value != ""){
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
    <textarea id="textareaEl" v-model="content" @input="changeSize" :rows="resizeText">
    </textarea>
  <button @click="send" v-if="!props.smallScreen">
    发送
  </button>
  <button @click="send" v-if="props.smallScreen" style="width: 100px">
    发送
  </button>
</template>

<style scoped>
#textareaEl {
  border: rgb(220, 220, 220) 1px solid;
  width: 100%;
  resize: none;
  padding: 8px 10px;
  font-size: 16px;
  overflow: auto;
  max-height: 300px;
}
#textareaEl::-webkit-scrollbar,
#textareaEl:hover,
#textareaEl:focus,
#textareaEl:focus-visible {
  border: #1c99ee solid 1px;
  box-shadow: #abdeff 0 0 8px;
}
button {
  position: relative;
  top: calc(100% - 45px);
  height: 45px;
  width: 150px;
  margin-left: 5px;
  padding: 8px 5px;
  color: rgba(255,255,255,0.9);
  border-radius: 10px;
  border: transparent;
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
}
</style>