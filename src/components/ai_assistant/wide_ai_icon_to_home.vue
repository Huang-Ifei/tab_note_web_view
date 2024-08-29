<script setup lang="ts">

import router from "../../router";
</script>

<template>
  <div class="title">
    <img @click="router.back()" src="../../assets/arrow_back_white.svg" alt="image"
         style="padding-left: 20px;padding-right: 2px;height: 25px;cursor: pointer"/>
    <a href="/" style="color: white">
      <h3 style="margin: 0">
        TabNote_
      </h3>
    </a>
    <h3 style="  margin: 0; background: linear-gradient(45deg, #ec86ff, #34dbff);-webkit-background-clip: text;-webkit-text-fill-color: transparent;">
      AI</h3>
  </div>
</template>

<style scoped>
.title{
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  min-width: 100%;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: start;
  position: absolute;
}
</style>