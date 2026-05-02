<script setup lang="ts">

import {ref, watch} from "vue";

const state = ref(0)

const type = ref(2)

const dataJson = ref({
  "width": 1920,
  "height": 1080,
  "切换投弹镜": 2,
  "俯冲参数": 45.0,
  "俯冲角度参数": 0.1,
  "提前投弹参数": 40,
  "投弹修正参数": 0.3,
  "投弹次数": 18,
  "卡研发": 1,
  "ccip": 1,
  "ccrp": 1,
  "ccrp火箭弹": 1,
  "地面启动": 1,
  "起飞时长": 30.0,
  "目标选择": 1,
  "开始降速间隔": 90,
  "降速时长": 3,
  "火控系统接管目标选择": 1
})

watch(type, (newVal) => {
  if (newVal == 2) {
    dataJson.value.ccrp = 0
    dataJson.value.ccip = 0
    dataJson.value.ccrp火箭弹 = 0
    dataJson.value.地面启动 = 0
  } else if (newVal == 4) {
    dataJson.value.ccrp = 1
    dataJson.value.ccip = 0
    dataJson.value.ccrp火箭弹 = 0
    dataJson.value.地面启动 = 1
  }
})

function copyText(s: string) {
  //创建一个textarea并且放在-100层，并且提交一个copy操作
  const el = document.createElement('textarea');
  el.value = s;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.zIndex = '-100'
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  alert('复制成功')
}
</script>

<template>
  <div v-if="state==0">
    <h1>FSF图形化参数设置</h1>
    <button @click="state=1">开始配置data.json</button>
  </div>
  <div v-if="state==1">
    <h2>您的屏幕像素宽高是多少？</h2>
    宽：←→<input type="number" v-model="dataJson.width">
    高：↑↓<input type="number" v-model="dataJson.height">
    <div class="row_div">
      <button @click="state=0">返回</button>
      <button @click="state=2">继续</button>
    </div>
  </div>
  <div v-if="state==2">
    <h2>请选择您的轰炸方式</h2>
    <select v-model="type">
      <option :value="2">在历史性能下，使用“空出”且带“投弹镜”的飞机进行战区轰炸</option>
      <option :value="4">在历史性能下，使用带有“CCRP”的飞机进行战区轰炸</option>
    </select>
    <div class="row_div">
      <button @click="state=1">返回</button>
      <button @click="state=3">继续</button>
    </div>
  </div>
  <div v-if="state==3&&type==2">
    <h2>请问您的轰炸机切换到投弹镜需要点按几下“V”？</h2>
    <select v-model="dataJson.切换投弹镜">
      <option :value="1">1</option>
      <option :value="2">2</option>
      <option :value="3">3</option>
      <option :value="4">4</option>
    </select>
    <div class="row_div">
      <button @click="state=2">返回</button>
      <button @click="state=4">继续</button>
    </div>
  </div>
  <div v-if="state==3&&type==4">
    <h2>您的飞机从机场起飞时，需要多少秒才能保持平飞？</h2>
    <select v-model="dataJson.起飞时长">
      <option :value="20">20秒，轻型飞机</option>
      <option :value="25">25秒，中型飞机</option>
      <option :value="30">30秒，重型飞机</option>
      <option :value="35">35秒，超重型飞机</option>
      <option :value="40">40秒，极端情况</option>
    </select>
    <div class="row_div">
      <button @click="state=2">返回</button>
      <button @click="state=4">继续</button>
    </div>
  </div>
  <div v-if="state==4&&type==2">
    <h2>你希望俯冲的角度是什么样的呢？</h2>
    <select v-model="dataJson.俯冲角度参数">
      <option :value="0.05">更保守的俯冲</option>
      <option :value="0.1">普通的俯冲</option>
      <option :value="0.15">更大的角度</option>
      <option :value="0.2">近乎垂直的俯冲</option>
    </select>
    <h2>你希望俯冲多久呢？</h2>
    <select v-model="dataJson.俯冲参数">
      <option :value="20">20秒</option>
      <option :value="25">25秒</option>
      <option :value="30">30秒（B25推荐时长）</option>
      <option :value="40">40秒（佩2推荐时长）</option>
      <option :value="45">45秒（B17推荐时长）</option>
      <option :value="50">50秒</option>
      <option :value="60">60秒</option>
      <option :value="70">70秒</option>
      <option :value="80">80秒</option>
      <option :value="90">90秒</option>
      <option :value="100">100秒</option>
      <option :value="110">110秒（B29推荐时长）</option>
    </select>
    <div class="row_div">
      <button @click="state=3">返回</button>
      <button @click="state=5">继续</button>
    </div>
  </div>
  <div v-if="state==4&&type==4">
    <h2>为了应对投弹限速，你打算多久执行一次降速？</h2>
    <select v-model="dataJson.开始降速间隔">
      <option :value="80">80秒，保守的降速选择，大图可能会降速两次</option>
      <option :value="90">90秒</option>
      <option :value="100">100秒</option>
      <option :value="110">110秒</option>
      <option :value="120">120秒，F4推荐的保守降速选择</option>
      <option :value="130">130秒，F4推荐的降速选择</option>
      <option :value="140">140秒</option>
      <option :value="150">150秒</option>
      <option :value="160">160秒</option>
      <option :value="180">180秒</option>
      <option :value="300">不准备进行降速</option>
    </select>
    <h2>每次降速你准备降速多久？</h2>
    <select v-model="dataJson.降速时长">
      <option :value="1">1秒</option>
      <option :value="2">2秒</option>
      <option :value="3">3秒</option>
      <option :value="4">4秒</option>
      <option :value="5">5秒</option>
      <option :value="6">6秒</option>
      <option :value="7">7秒</option>
      <option :value="8">8秒</option>
    </select>
    <div class="row_div">
      <button @click="state=3">返回</button>
      <button @click="state=5">继续</button>
    </div>
  </div>
  <div v-if="state==5&&type==2">
    <h2>投弹前你要以怎样的幅度进行修正呢？</h2>
    <select v-model="dataJson.投弹修正参数">
      <option :value="0.1">0.1，小范围的调整，适用于轻型的飞机</option>
      <option :value="0.2">0.2，中等范围的调整，适用于如佩2这类飞机</option>
      <option :value="0.3">0.3，中等范围的调整</option>
      <option :value="0.4">0.4，中等范围的调整，适用于如B17这类飞机</option>
      <option :value="0.45">0.45，中等偏高范围的调整</option>
      <option :value="0.5">0.5，较高范围的调整，适用于如B29这类飞机</option>
    </select>
    <div class="row_div">
      <button @click="state=4">返回</button>
      <button @click="state=6">生成内容</button>
    </div>
  </div>
  <div v-if="state==6&&type==2">
    <h2>一次性你要投出多少炸弹呢？</h2>
    <input type="number" v-model="dataJson.投弹次数">
    <div class="row_div">
      <button @click="state=5">返回</button>
      <button @click="state=10">生成内容</button>
    </div>
  </div>
  <div v-if="state==5&&type==4">
    <h2>您需要用什么方式选定目标？</h2>
    <p>注意！需要使用火控系统接管目标选择，请先打开战雷设置“空战” “武器控制”中的：“火控系统：切换轰炸任务目标”
      设置按键：B</p>
    <select v-model="dataJson.火控系统接管目标选择">
      <option :value="0">使用AI识别标战区</option>
      <option :value="1">火控系统接管</option>
    </select>
    <div class="row_div">
      <button @click="state=4">返回</button>
      <button @click="state=10">生成内容</button>
    </div>
  </div>
  <div v-if="state==10">
    <p style="width: 50%">
      {{ dataJson }}
    </p>
    <div class="row_div">
      <button @click="state=1">返回初始界面</button>
      <button @click="copyText(JSON.stringify(dataJson))">一键复制</button>
    </div>
  </div>
</template>

<style scoped>
div {
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.row_div {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  width: fit-content;
  height: fit-content;
}

.row_div button {
  margin: 10px 5px;
  padding: 10px 30px;
}

select {
  padding: 10px;
  border-radius: 5px;
}
</style>