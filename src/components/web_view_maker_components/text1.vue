<script setup lang="ts">
const props = defineProps(["text","css","sty"])
</script>

<template>
  <p :style="props.sty" >{{props.text}}</p>
</template>

<style scoped>

</style>