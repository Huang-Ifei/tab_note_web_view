<script setup lang="ts">

import {ref} from "vue";
import axios from "axios";
import {getAddress} from "../operation/address.ts";

const account = ref("")
const key = ref("")
const color = ref("black")

async function get(){
  const response = await axios.get(getAddress()+"/xian?authCode="+key.value+"&account="+account.value)
  console.log(response.data)
  if (response.data.code==-1){
    alert("授权码已失效")
    color.value = "#c11524"
  }else if(response.data.code==0){
    alert("使用成功")
    color.value = "#15ab20"
  }
}

</script>

<template>
<div class="background">

  <div class="card">
    <h2><img src="../assets/xian.ico" style="height: 20px">&nbsp;咸の助</h2>
    账号
    <input v-model="account" @click="color='black'" :style="{color:color}" type="text">
    授权码
    <input v-model="key" @click="color='black'" :style="{color:color}" type="text">
    <button id="button" @click="get">
      验证->
    </button>
  </div>
</div>
</template>

<style scoped>
h2{
  margin-top: 10px;
  margin-bottom: 5px;
}
.background{
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.card{
  width: 350px;
  max-width: calc(100vw - 50px);
  background: rgba(242, 242, 242, 0.85);
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 10px;
}
#button{
  margin-top: 20px;
  margin-bottom: 10px;
  background: #000000;
  color: #ffffff;
  width: 100%;
  height: 45px;
  padding: 0;
}
#button:hover {
  border-color: #000000;
  border-width: 0;
}
</style>