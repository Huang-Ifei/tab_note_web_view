<script setup lang="ts">
const props = defineProps(["child","text","sty"])
</script>

<template>
  <div class="title" :style="props.sty">
    <h1 style="font-size: 18px;margin-left: 20px;width: 100%">
      {{props.text}}
    </h1>
    <button v-for="c in props.child.a">
      {{c.name}}
    </button>
  </div>
</template>

<style scoped>
button{
  background: transparent;
  color: rgba(26, 26, 26, 0.9);
  margin: 5px 2px;
  font-size: 13px;
  cursor: pointer;
  min-width: 90px;
}
.title{
  top: 0;
  z-index: 200;
  align-items: center;
  color: rgb(51, 51, 51);
  display: flex;
  min-width: 100%;
  max-width: 100%;
  height: 54px;
  backdrop-filter: blur(10px);
  background: rgb(235, 236, 239);
}
</style>