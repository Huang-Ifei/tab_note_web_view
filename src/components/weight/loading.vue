<script setup lang="ts">

import {ref} from "vue";

const max = ref(3)
const count = ref(0)

setInterval(() => {
  if (count.value < max.value) {
    count.value++
  }else{
    count.value=0;
  }
}, 250)
</script>

<template>
  <div style="padding-left: 5px;display: flex;flex-direction: row;height: fit-content;justify-content: center;align-items: center">
    <div v-for="i in max">
      <div v-if="i==count" style="background: linear-gradient(45deg, #ec86ff, #34dbff);width: 0.5rem;height: 0.5rem;border-radius: 0.5rem;margin-right: 0.5rem;cursor: pointer;">

      </div>
      <div v-else-if="i!=count" style="background: #d7d7d7;width: 0.5rem;height: 0.5rem;border-radius: 0.5rem;cursor: pointer;margin-right: 0.5rem">

      </div>
    </div>
  </div>
</template>

<style scoped>

</style>