<script setup lang="ts">
import {ref} from "vue";
import * as Cookies from "js-cookie";
import {getAccountImg} from "../../operation/dataOperation.ts";
import router from "../../router";
import {isApp} from "../../operation/dataOperation.ts";

const imageURL = ref("")
imageURL.value = getAccountImg()

const emit = defineEmits(['rightChoice'])

console.log(Cookies.default.get("name"))

</script>

<template>
  <div class="small_title">
    <img @click="router.back()" src="../../assets/arrow_back.svg" alt="image"
         style="padding-left: 10px;padding-right: 2px;height: 25px"/>
    <a href="/">
      <h3 style="margin: 0">
        TabNote_
      </h3>
    </a>
    <h3 style="background: linear-gradient(45deg, #e961fb, #13c2e6);-webkit-background-clip: text;-webkit-text-fill-color: transparent;min-width: fit-content">
      AI识题</h3>
    <div class="icons">
      <img v-if="!isApp()" @click="router.push('login')" id="usrImage" :src="imageURL" alt="image"/>
    </div>
  </div>
</template>

<style scoped>
.small_title {
  position: absolute;
  background-color: rgba(242, 242, 242, 0.8);
  backdrop-filter: blur(10px);
  z-index: 500;
  width: calc(100% - 30px);
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
  color: rgba(0, 0, 0, 0.8);
  background: white;
  padding: 9px 20px;
  margin: 9px 10px 9px 5px;
  box-shadow: none;
  border: none;
}

#ai_button:hover {
  box-shadow: 0 0 8px #c6e9ff;
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