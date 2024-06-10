<script setup lang="ts">
import HelloTitle from "./weight/title.vue";
import Home_tab_view from "./tab_note/home_tab_view.vue";
import {ref} from "vue";
import Todo_plan_view from "./todo/todo_plan_view.vue";

const todo_view = ref(false)

function showTodoView(active: boolean) {
  console.log(active);
  todo_view.value = active
}
</script>

<template>
  <div id="home_view">
    <div class="title">
      <HelloTitle @todoView="showTodoView"/>
    </div>
    <transition name="todo">
      <todo_plan_view v-if="todo_view" @doClose="showTodoView"/>
    </transition>
      <home_tab_view/>
  </div>
</template>

<style scoped>
.todo-enter-active{
  transition: opacity 0.25s ease;
}

.todo-leave-active {
  transition: opacity 0.25s ease;
}
.todo-enter-from,
.todo-leave-to {
  opacity: 0;
}
#home_view{
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>