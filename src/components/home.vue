<script setup lang="ts">
import HelloTitle from "./weight/title.vue";
import Home_tab_view from "./weight/home_tab_view.vue";
import Todo_notes_view from "./weight/todo_notes_view.vue";
</script>

<template>
  <div id="home_view">
    <div class="title">
      <HelloTitle/>
    </div>
    <div id="todo_and_notes">
      <todo_notes_view/>
      <home_tab_view/>
    </div>
  </div>
</template>

<style scoped>
#todo_and_notes{
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 58px);
}
#home_view{
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>