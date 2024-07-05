<script setup lang="ts">

import {isApp} from "../../operation/dataOperation.ts";
import router from "../../router";

const emit = defineEmits(['leftClose','todoView'])

</script>

<template>
  <div class="background">
    <div class="left_background">
      <img src="../../assets/arrow_back_white.svg" @click="emit('leftClose')" class="close_button">
      <div @click="router.push('add_tab_note')" class="choice_button" style="padding-top: 20px">
        新建贴文
      </div>
      <div @click="router.push('note_ai')" class="choice_button">
        AI笔记
      </div>
      <div @click="emit('todoView',true)" class="choice_button" v-if="!isApp()">
        待办/计划
      </div>
    </div>
  </div>
</template>

<style scoped>
.choice_button{
  padding: 0.4rem 2rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
  font-size: 1.5rem;
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
  justify-content: start;
}

.left_background {
  position: relative;
  box-shadow: 0 0 8px #6a6a6a;
  background: #1e1e1e;
  border-radius: 0;
  display: flex;
  width: 70%;
  height: 100%;
  flex-direction: column;
  pointer-events: visible;
}
</style>