<script setup lang="ts">

import {Ref, ref} from "vue";

const props = defineProps(['mess_list'])

const ai_history:Ref<{}[]> = ref(props.mess_list)

const emit = defineEmits(['rightClose','choice','newChat','getHistoryAiMessages'])

</script>

<template>
  <div class="background">
    <div class="left_background">
      <img src="../../assets/arrow_forward.svg" @click="emit('rightClose')" class="close_button">
      <button @click="emit('newChat');emit('rightClose')" class="his_button">
        +新建对话+
      </button>
      <button v-for="value in ai_history" class="his_button" :key="JSON.parse(JSON.stringify(value)).ai_ms_id"
              @click="emit('getHistoryAiMessages',JSON.parse(JSON.stringify(value)).ai_ms_id.toString());emit('rightClose')">
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
  z-index: 80;
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
  height: 100%;
  flex-direction: column;
  pointer-events: visible;
}
</style>