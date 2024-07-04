<script setup lang="ts">

import {Ref, ref} from "vue";
import router from "../../router";

const props = defineProps(['list'])

const history:Ref<{}[]> = ref(props.list)

const emit = defineEmits(['rightClose','choice','newChat','getHistoryAiMessages'])

</script>

<template>
  <div class="background">
    <div class="left_background">
      <img src="../../assets/arrow_forward.svg" @click="emit('rightClose')" class="close_button">
      <div style="min-height: 3px;display: flex;">

      </div>
      <button style="display: flex; align-items: center;justify-content: center;padding: 10px" @click="emit('newChat');emit('rightClose')" class="his_button">
        <img src="../../assets/edit.svg" alt="edit" style="margin-right: 2px"/>
        新建笔记
      </button>
      <button @click="router.push('ai_assistant')" style="display: flex; align-items: center;justify-content: center;padding: 10px" class="his_button">
        <img src="../../assets/messages.svg" alt="edit" style="margin-right: 2px"/>
        对话式AI
      </button>
      <div style="min-height: 8px;display: flex;">

      </div>
      <button v-for="value in history" class="his_button" :key="JSON.parse(JSON.stringify(value)).note_ai_id"
              @click="emit('getHistoryAiMessages',JSON.parse(JSON.stringify(value)).note_ai_id.toString());emit('rightClose')">
        {{ JSON.parse(JSON.stringify(value)).mainly }}
      </button>

    </div>
  </div>
</template>

<style scoped>

.his_button{
  width: calc(100% - 20px);
  margin-left: 10px;
  margin-right: 10px;
  color: #000000;
  background: white;
  margin-bottom: 8px;
}

.close_button {
  cursor: pointer;
  width: fit-content;
  height: fit-content;
  background: transparent;
  padding: 15px 20px;
}

.background {
  width: 100%;
  height: 100%;
  background: rgba(28, 28, 28, 0.5);
  position: absolute;
  display: flex;
  z-index: 580;
  justify-content: end;
}

.left_background {
  position: relative;
  box-shadow: 0 0 8px #6a6a6a;
  background-color: #f6f7f8;
  border-radius: 0;
  overflow: auto;
  display: flex;
  width: 70%;
  max-width: 280px;
  height: 100%;
  flex-direction: column;
  pointer-events: visible;
}
</style>