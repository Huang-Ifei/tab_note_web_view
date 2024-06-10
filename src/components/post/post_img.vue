<script setup lang="ts">
defineProps(['post_values', 'post_num'])
</script>

<template>
  <div v-for="(post,ii) in post_values" style="position: relative;height: auto;overflow: hidden">
    <Transition>
        <img :key="ii" id="post" v-show="post_num==ii" :src="post.post_picture" style="width: 100%;border-radius: 10px 10px 0  0"/>
    </Transition>
  </div>
</template>

<style scoped>
.v-enter-active{
  transition: opacity 0.5s ease;
}

.v-leave-active {
  transition: opacity 0.5s ease;
  position: absolute;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>