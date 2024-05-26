<script setup lang="ts">
import {ref} from "vue";

//父组件传入的function、数据等内容
const props = defineProps(['setText'])
//父组件传入的事件
const emit = defineEmits(['doSend'])

const content = ref("");
const resizeText = ref(1)

function changeSize() {
  props.setText(content.value)
  resizeText.value = content.value.split('\n').length
}

function send() {
  if(content.value != ""){
    emit('doSend', content.value)
    content.value = "";
    resizeText.value = 1
  }
}
</script>

<template>
  <textarea id="textareaEl" v-model="content" @input="changeSize" :rows="resizeText">
    </textarea>
  <button @click="send">
    发送
  </button>
</template>

<style scoped>
#textareaEl {
  font-family: Ubuntu;
  border: rgb(220, 220, 220) 2px solid;
  width: 100%;
  resize: none;
  padding: 10px;
  font-size: 16px;
  overflow: auto;
  max-height: 300px;
}
#textareaEl:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
button {
  position: relative;
  top: calc(100% - 45px);
  height: 45px;
  background: #1e1e1e;
  width: 150px;
  margin-left: 5px;
  padding: 5px;
  border-radius: 10px;
}
</style>