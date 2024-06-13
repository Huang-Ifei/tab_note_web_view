<script setup lang="ts">
import {ref} from "vue";
import * as Cookies from "js-cookie";
import {getAccountImg} from "../../operation/dataOperation.ts";
import router from "../../router";

const imageURL = ref("")
imageURL.value = getAccountImg()

const emit = defineEmits(['rightChoice'])

console.log(Cookies.default.get("name"))

</script>

<template>
  <div class="small_title">
    <img @click="router.push('/')" src="../../assets/arrow_back_white.svg" alt="image"
         style="padding-left: 10px;padding-right: 2px;height: 25px"/>
    <h3 style="margin: 0">
      TabNote_
    </h3>
    <div class="icons">
      <button id="ai_button">
        历史记录
      </button>
    </div>
  </div>
</template>

<style scoped>
.small_title {
  background: #1e1e1e;
  color: rgb(255, 255, 255);
  height: 54px;
  padding: 0 20px 0 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
}
#ai_button {
  font-size: 14px;
  color: transparent;
  background: transparent;
  padding: 9px 20px;
  margin: 9px 10px 9px 5px;
  box-shadow: none;
  border: none;
}

#ai_button:hover {
  box-shadow: none;
  border: none;
}

.icons {
  left: auto;
  position: marker;
  width: 100%;
  display: flex;
  justify-content: right;
}

#usrImage {
  cursor: pointer;
  outline: 2px solid white;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 50%;
}

#usrImage:hover {
  box-shadow: 0 0 12px #c6e9ff;
}
</style>