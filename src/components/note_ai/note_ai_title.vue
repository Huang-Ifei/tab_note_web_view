<script setup lang="ts">
import {ref} from "vue";
import * as Cookies from "js-cookie";
import {getAccountImg} from "../../operation/dataOperation.ts";
import router from "../../router";
import {isApp} from "../../operation/dataOperation.ts";

const imageURL = ref("")
imageURL.value = getAccountImg()
const props = defineProps(['small'])
const emit = defineEmits(['rightChoice', 'tryDC'])
const show_aiDC_info = ref(false)
console.log(Cookies.default.get("name"))

</script>

<template>
  <div class="small_title">
    <img @click="router.back()" src="../../assets/arrow_back.svg" alt="image"
         style="padding-left: 10px;padding-right: 2px;height: 25px;cursor: pointer"/>
    <a href="/">
      <h3 style="margin: 0;color: #434343">
        TabNote_
      </h3>
    </a>
    <h3 style="background: linear-gradient(45deg, #e961fb, #13c2e6);-webkit-background-clip: text;-webkit-text-fill-color: transparent;min-width: fit-content">
      AI笔记</h3>
    <div class="icons">
      <div v-if="!props.small"
           style="color: white;height: 60px;display: flex;flex-direction: row;justify-content: center;align-items: center"><!--
        <input type="checkbox" @click="emit('tryDC')">
        <p style="font-size: 13px;margin-right: 10px;color: #434343" @mousemove="show_aiDC_info=true">分布式AI</p>-->
      </div>
      <button id="ai_button" @click="emit('rightChoice')">
        历史记录
      </button>
      <img v-if="!isApp()" @click="router.push('login')" id="usrImage" :src="imageURL" alt="image"/>
    </div>
  </div>
  <div v-if="show_aiDC_info" class="aiDC_info" @mouseleave="show_aiDC_info=false" @click="show_aiDC_info=false">
    <h3>了解分布式AI</h3>
    开启分布式AI，我们将会把您的AI请求发送到“TabNote分布式AI计算算力分配中心”在哪里等待开启算力贡献的设备承揽您的计算需求！<br>
    分布式AI的优势：永久免费，所有的算力来自于用户提供！<br>
    分布式AI的劣势：模型较小，可能给出的答案不够精确，难以胜任创造性的任务；需要经过一定的等待，这取决于正在贡献算力的设备数量、请求计算的人数以及计算设备的性能；并且算力贡献设备将可以查看您的请求内容。<br>
  </div>
</template>

<style scoped>
.aiDC_info {
  position: absolute;
  margin-left: calc(100% - 500px);
  margin-top: 62px;
  padding: 10px 20px;
  min-width: 360px;
  max-width: 360px;
  min-height: 320px;
  border-radius: 10px;
  background: rgba(250, 250, 250, 0.8);
  backdrop-filter: blur(5px);
  color: #1c1c1c;
  z-index: 500;
  box-shadow: 0 0 12px #d0d0d0;
}

.small_title {
  user-select: none;
  /* 对于跨浏览器兼容性，可以添加以下前缀 */
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  background-color: rgb(255, 255, 255);
  backdrop-filter: blur(10px);
  height: 54px;
  padding: 0 20px 0 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
}

#ai_button {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.8);
  background: #ececec;
  padding: 9px 20px;
  margin: 9px 10px 9px 5px;
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