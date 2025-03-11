<script setup lang="ts">

import router from "../../router";
import {getAccountImg, getLocalData, isApp} from "../../operation/dataOperation.ts";
import {ref} from "vue";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";

getRank()

const rank = ref(0)

async function getRank() {
  const response = await axios.get(getAddress() + "/vip/rank?id=" + getLocalData("id"))
  rank.value = response.data.rank
}

const imageURL = ref("")
imageURL.value = getAccountImg()

</script>

<template>
  <div
      style="overflow: auto;width:100vw;height:100vh;max-width: 100vw;min-width: 800px;background:#f3f3f5;position:absolute;">
    <div style="display: flex;flex-direction: row; align-items: flex-end;">
      <p @click="router.push('/')"
         style="cursor: pointer;min-width: fit-content;margin: 30px 10px 5px 40px;font-size: 1.5rem;font-weight: bold">
        TabNote_低代码平台
      </p>
      <div
          style="width: 100%;height: 3rem;display: flex;flex-direction: row; align-items:center;justify-content:flex-end">
        <img v-if="rank==2" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA.svg"
             style="width: 5rem;margin-right: 0.4rem;margin-top: 0.9rem"/>
        <img v-if="rank==4" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA+.svg"
             style="width: 5rem;margin-right: 0.4rem;margin-top: 0.9rem"/>
        <img v-if="rank==6" @click.stop="router.push('afa')" alt="vip_rank" src="../../assets/vip/AFA++.svg"
             style="width: 5rem;margin-right: 0.4rem;margin-top: 0.9rem"/>
        <img v-if="!isApp()" @touchstart.stop @touchmove.stop @touchend.stop @click.stop="router.push('login')"
             style="height: 3rem;width: 3rem;border-radius: 3rem;margin-right: 40px" :src="imageURL" alt="image"/>
      </div>
    </div>

    <div class="back_low_code">
      <div class="card" style="color: #c1c1c1;" @click="router.push('web_view_maker')">
        网页制作（可高度定制化）
      </div>
      <div class="card" @click="router.push('huffman')">
        数据结构·赫夫曼编码（有限定制）
      </div>
      <div class="card" style="color: #c1c1c1;">
        C语言（内存）·管理系统（有限定制）
      </div>
      <div class="card" style="color: #c1c1c1;">
        JavaWeb（JSP）·管理系统（有限定制）
      </div>
      <div class="card" style="color: #c1c1c1;">
        SpringBoot+Vue3管理系统（有限定制）
      </div>
      <div class="card" style="color: #c1c1c1;">
        定制需求➡
      </div>
    </div>


  </div>

</template>

<style scoped>

.back_low_code {
  max-width: 100vw;
  min-width: 800px;
  flex-wrap: wrap;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 100px
}

.card {
  width: 20%;
  min-width: 20%;
  height: 10vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 10px;
  margin: 10px;
  cursor: pointer;
}
</style>