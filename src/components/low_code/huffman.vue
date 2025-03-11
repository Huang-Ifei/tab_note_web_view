<script setup lang="ts">

import {ref} from "vue";
import {getLowCodeToken} from "../../operation/low_code.js";
import {getAddress} from "../../operation/address.js";
import router from "../../router/index.js";

const language = ref("")

const environment = ref("")

const save = ref("")

const costQuota = ref(0)

function countCost() {

  let cq = 0

  if (language.value === "Java" && environment.value === "JDK17") {
    cq = 1500000
  } else if (language.value === "Java" && environment.value === "JDK8") {
    cq = 1800000
  } else if ((language.value === "C" || language.value === "C++") && (environment.value === "Visual Studio")) {
    cq = 2000000
  } else {
    environment.value = ""
  }
  if (save.value === "save") {
    cq += 10000
  } else if (save.value === "remove") {

  }
  costQuota.value = cq
  return costQuota.value
}

async function getCode() {
  const info = {language: language.value, environment: environment.value, save: save.value}
  let codeToken = ""
  codeToken = await getLowCodeToken("huffman", info)
  if (codeToken === "quota_low") {
    alert("额度不足")
  } else if (codeToken.startsWith("err")) {
    alert("生成出错:"+codeToken+";请重试")
  } else {
    await router.push(getAddress() + "/low_code/file?lc_id=" + codeToken);
  }
}

</script>

<template>
  <div
      class="low_code_background">
    <div style="position: absolute;padding: 20px;">
      <img alt="back" style="cursor: pointer" @click="router.back()" src="../../assets/arrow_back.svg">
    </div>
    <div
        class="low_code_left">
      <img src="../../assets/low_code/huffman.png"
           style="width: 50vh;height: 50vh;max-width: 50vw;max-height: 50vw;border-radius: 5vh">
    </div>
    <div
        class="low_code_right">
      <h3>
        生成Huffman编码程序
      </h3>
      <p>选择语言：</p>
      <select v-model="language">
        <option value="C">C</option>
        <option value="C++">C++</option>
        <option value="Java">Java</option>
      </select>
      <p v-if="language!==''">选择环境：</p>
      <select v-if="language==='Java'" v-model="environment">
        <option value="JDK17">JDK17</option>
        <option value="JDK8">JDK8</option>
      </select>
      <select v-if="language==='C'||language==='C++'" v-model="environment">
        <option value="Visual Studio">Visual Studio</option>
      </select>
      <p v-if="environment!==''">是否需要程序分离压缩读取：</p>
      <select v-if="language!==''&&environment!==''" v-model="save">
        <option value="remove">不需要（压缩率更高，但只能在一个程序中压缩和解压缩）</option>
        <option v-if="language!=='C'&&language!=='C++'" value="save">需要（更符合实际应用，压缩会输出压缩文件和字典）
        </option>
      </select>
      <p class="tip" style="margin: 10px 0 10px 0" v-if="language!==''&&environment!==''&&save!==''">
        现在，生成Huffman编码程序将会附带程序设计报告<br>
        重复生成完全一样的内容将不会耗费额度<br>
        无法理解的地方请根据程序压缩包内Readme.txt文件向我们求助
      </p>
      <button @click="getCode()" v-if="language!==''&&environment!==''&&save!==''">
        花费&nbsp;{{ countCost() }}额度&nbsp;以获取程序
      </button>
    </div>
  </div>
</template>

<style scoped>
@import "../../operation/low_code.css";
</style>