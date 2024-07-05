<script setup lang="ts">

import router from "../../router";
</script>

<template>
  <div class="title">
    <img @click="router.back()" src="../../assets/arrow_back_white.svg" alt="image"
         style="padding-left: 20px;padding-right: 2px;height: 25px;cursor: pointer"/>
    <a href="/">
      <h3 style="margin: 0">
        TabNote_
      </h3>
    </a>
  </div>
</template>

<style scoped>
.title{
  background-color: #1e1e1e;
  min-width: 100%;
  min-height: 54px;
  max-height: 54px;
  display: flex;
  align-items: center;
  justify-content: start;
}
a {
  color: rgb(255, 255, 255);
  display: flex;
  margin: 0;
}
</style>