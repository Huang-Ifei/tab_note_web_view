<script setup lang="ts">
import {ref} from "vue";
import * as Cookies from "js-cookie";
import {getAccountImg} from "../../operation/dataOperation.ts";
import router from "../../router";


const imageURL = ref("")
imageURL.value = getAccountImg()

console.log(Cookies.default.get("name"))

</script>

<template>
  <div class="title">
    <h3 style="margin: 0;padding-left: 20px">
      TabNote_
    </h3>
    <div class="icons">
      <button class="none_button" onclick="location.href='/add_tab_note'">
        新建贴文
      </button>
      <button id="ai_button" onclick="location.href='/ai_assistant'">
        AI助手
      </button>
        <img @click="router.push('login')" id="usrImage" :src="imageURL" alt="image"/>
    </div>
  </div>
</template>

<style scoped>

.title {
  background: #1e1e1e;
  color: rgb(255, 255, 255);
  height: 54px;
  padding: 0 20px 0 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.icons {
  position: marker;
  width: 100%;
  display: flex;
  justify-content: right;
}
.none_button{
  border-radius: 0;
  font-size: 13px;
  background: transparent;
  box-shadow: none;
  color: #eaeaea;
  border: none;
}
.none_button:hover{
  color: #ffffff;
  background: #333333;
  outline: 0;
  border: none;
  text-shadow: 0 0 8px #c6e9ff;
}
.none_button:focus{
  color: #ffffff;
  background: #333333;
  outline: none;
  border: none;
  text-shadow: 0 0 8px #c6e9ff;
}
#ai_button {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.8);
  background: white;
  padding: 9px 20px;
  margin: 9px 10px 9px 5px;
  box-shadow: none;
  border: none;
}
#ai_button:hover{
  box-shadow: 0 0 8px #c6e9ff;
  border: none;
}
img {
  cursor: pointer;
  outline: 2px solid white;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 50%;
}
img:hover{
  box-shadow: 0 0 12px #c6e9ff;
}
</style>