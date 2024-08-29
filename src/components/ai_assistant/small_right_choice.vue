<script setup lang="ts">

import {Ref, ref} from "vue";
import router from "../../router";

const props = defineProps(['mess_list','ai_ms_id'])

const ai_history:Ref<{}[]> = ref(props.mess_list)

const emit = defineEmits(['rightClose','choice','newChat','getHistoryAiMessages'])

</script>

<template>
  <div class="background" @click="emit('rightClose')">
    <div class="left_background">
      <img src="../../assets/arrow_forward.svg" @click="emit('rightClose')" class="close_button">
      <div style="min-height: 3px;display: flex;">

      </div>
      <button style="display: flex; align-items: center;justify-content: center;padding: 10px" @click="emit('newChat');emit('rightClose')" class="his_button">
        <img src="../../assets/edit.svg" alt="edit" style="margin-right: 2px"/>
        新建对话
      </button>
      <button @click="router.push('note_ai')" style="display: flex; align-items: center;justify-content: center;padding: 10px" class="his_button">
        <img src="../../assets/edit_note.svg" alt="edit" style="margin-right: 2px"/>
        笔记型AI
      </button>
      <div style="min-height: 8px;display: flex;">

      </div>
      <div v-for="value in ai_history" :key="JSON.parse(JSON.stringify(value)).ai_ms_id"
           @click="emit('getHistoryAiMessages',JSON.parse(JSON.stringify(value)).ai_ms_id.toString());emit('rightClose')">
        <button class="his_button" v-if="props.ai_ms_id==JSON.parse(JSON.stringify(value)).ai_ms_id.toString()" style="outline: #009bff auto 1px">
          {{ JSON.parse(JSON.stringify(value)).mainly }}
        </button>
        <button class="his_button" v-else>
          {{ JSON.parse(JSON.stringify(value)).mainly }}
        </button>
      </div>
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
  width: fit-content;
  height: fit-content;
  background: transparent;
  padding: 15px 20px;
}

.background {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: absolute;
  display: flex;
  z-index: 580;
  justify-content: end;
}

.left_background {
  position: relative;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
  background-color: rgba(250, 250, 250, 0.9);
  border-radius: 0;
  overflow: auto;
  display: flex;
  width: 70%;
  height: 100%;
  flex-direction: column;
  pointer-events: visible;
}
</style>