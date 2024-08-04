<script setup lang="ts">
import HelloTitle from "./weight/title.vue";
import Home_tab_view from "./tab_note/home_tab_view.vue";
import {onBeforeMount, onBeforeUnmount, ref} from "vue";
import Todo_plan_view from "./todo/todo_plan_view.vue";
import Small_left_choice from "./weight/small_left_choice.vue";
import Small_todo_plan_view from "./todo/small_todo_plan_view.vue";
import {isApp} from "../operation/dataOperation.ts";

const todo_view = ref(false)
const left_choice = ref(false)

function showTodoView(active: boolean) {
  console.log(active);
  todo_view.value = active
}

//监听大小
onBeforeMount(() => {
  renderResize();
  window.addEventListener("resize", renderResize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", renderResize);
});
const smallScreen = ref(false);
const renderResize = () => {
  let width = document.documentElement.clientWidth;
  if (width < 680||isApp()) {
    smallScreen.value = true;
  }
  //else if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
  //  smallScreen.value = true;
  //}
  else {
    smallScreen.value = false;
  }
}

</script>

<template>
  <div id="home_view" v-if="!smallScreen" style="background:#f6f7f8">
    <div class="title">
      <HelloTitle @todoView="showTodoView" :smallScreen="smallScreen" :todo="todo_view"/>
    </div>
    <transition name="todo">
      <todo_plan_view v-if="todo_view" @doClose="showTodoView" smallScreen="false"/>
    </transition>
    <div style="display: flex;flex-direction: row;padding: 0 10%;overflow-y: auto">
      <home_tab_view :small-screen="smallScreen" />
    </div>
  </div>

  <div id="small_home_view" v-if="smallScreen" style="background:#f6f7f8">
    <transition name="todo">
      <small_todo_plan_view v-if="todo_view" @doClose="showTodoView" smallScreen="true" style="z-index: 200"/>
    </transition>
    <transition name="small_left_choice">
      <small_left_choice v-if="left_choice" @leftClose="left_choice=false" @todoView="showTodoView"/>
    </transition>
    <div class="title">
      <HelloTitle @todoView="showTodoView" :smallScreen="smallScreen" @leftChoice="left_choice=true" :todo="todo_view"/>
    </div>
    <home_tab_view :small-screen="smallScreen"/>
  </div>

</template>

<style scoped>
.todo-enter-active {
  transition: opacity 0.25s ease;
}

.todo-leave-active {
  transition: opacity 0.25s ease;
}

.todo-enter-from,
.todo-leave-to {
  opacity: 0;
}


.small_left_choice-enter-active,
.small_left_choice-leave-active {
  transition: opacity 0.25s ease;
}

.small_left_choice-enter-from,
.small_left_choice-leave-to {
  opacity: 0;
}
#home_view {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

#small_home_view {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
</style>