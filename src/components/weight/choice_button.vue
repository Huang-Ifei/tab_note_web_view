<script setup lang="ts">

const model = defineModel()

</script>

<template>
  <div>
    <input type="radio" v-model="model" value="0" style="margin-right:2px">
    <input type="radio" v-model="model" value="1">
  </div>
</template>

<style scoped>
div{
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  background: white;
  border: 1px solid #5d5d5d;
  margin: 2px;
  padding: 2px;
  height: 20px;
  border-radius: 20px;
}
input{
  margin: 0;
  padding: 0;
  height: 20px;
  width: 20px;
}
input:focus,
input:hover{
  box-shadow: none;
}
</style>