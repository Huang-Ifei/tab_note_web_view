<script setup lang="ts">

import Icon_to_home from "../weight/icon_to_home.vue";
import {onBeforeMount, onBeforeUnmount, Ref, ref} from "vue";
import {getLocalData, isApp} from "../../operation/dataOperation.ts";
import Super_alert from "../weight/super_alert.vue";
import axios from "axios";
import {getAddress} from "../../operation/address.ts";

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
  if (width < 610 || isApp()) {
    smallScreen.value = true;
  }
      //else if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      //  smallScreen.value = true;
  //}
  else {
    smallScreen.value = false;
  }
}

const auth = ref("")
const alt = ref("")

async function check(s: string) {
  try {
    if(alt.value!="验证中"){
      alt.value = "验证中"
      const response = await axios.get(getAddress() + "/vip/check?auth=" + s + "&id=" + getLocalData("id"));
      if (response.data.rank == 0) {
        alt.value = "授权码可能失效！点击确认重试"
      } else {
        alert("验证成功")
        alt.value = ""
        await getAuthList()
      }
    }
  } catch (error) {
    alt.value = "发送失败！点击确认重试"
  }
}

const afaList:Ref<afaInfo[]> = ref([])
type afaInfo = {
  end_time: string,
  quota: number,
  rank: number,
  start_time: string,
  vip_id: string
}

getAuthList()

async function getAuthList() {
  try {
    const response = await axios.get(getAddress() + "/vip/info?id="+getLocalData("id"));
    afaList.value = response.data.list
  } catch (error) {
  }
}
</script>

<template>
  <icon_to_home/>
  <div style="width: 100%; height: 100%;position:absolute;display: flex;flex-direction: column;overflow: auto">
    <div style="height: 54px;min-height: 54px">

    </div>
    <h1>TabNote高级功能授权</h1>
    <p class="en">Advanced Function Authoritarian</p>
    <div v-if="!smallScreen" class="row">
      <div class="card">
        <img alt="vip_rank" src="../../assets/vip/AFA.svg" style="height: 30px"/>
        <p class="card_title">普通授权&nbsp;AFA</p>
        <p class="quota">每月285万额度</p>
        <div style="height: 15px">&nbsp;</div>
        <p class="info">AI对话默认使用基础4o mini模型</p>
        <p class="info">AI对话可选高级4o模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI识题可用高级4o OCR+工作流</p>
        <p class="info">AI识题可用DeepSeek r1 MIX+工作流</p>
        <p class="info">AI识题默认AM自动融合工作流</p>
        <p class="info">-</p>
        <p class="info">-</p>
        <p class="info">AI识题附带大学搜题酱</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI笔记使用基础4o mini模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">-</p>
        <div style="height: 20px">&nbsp;</div>
      </div>
      <div class="card">
        <img alt="vip_rank" src="../../assets/vip/AFA+.svg" style="height: 30px"/>
        <p class="card_title">高级授权&nbsp;AFA+</p>
        <p class="quota">每月1140万额度</p>
        <div style="height: 15px">&nbsp;</div>
        <p class="info">AI对话可选基础4o mini模型</p>
        <p class="info">AI对话默认高级4o模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI识题可用高级4o OCR+工作流</p>
        <p class="info">AI识题可用DeepSeek r1 MIX+工作流</p>
        <p class="info">AI识题默认AAM融合自动增强工作流</p>
        <p class="info">即将可用*AI识题o3-mini GPT工作流</p>
        <p class="info">-</p>
        <p class="info">AI识题附带大学搜题酱</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI笔记使用基础4o mini模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">-</p>
        <div style="height: 20px">&nbsp;</div>
      </div>
      <div class="card">
        <img alt="vip_rank" src="../../assets/vip/AFA++.svg" style="height: 30px"/>
        <p class="card_title">超级授权&nbsp;AFA++</p>
        <p class="quota">每月0.513亿额度</p>
        <div style="height: 15px">&nbsp;</div>
        <p class="info">AI对话可选基础4o mini模型</p>
        <p class="info">AI对话默认高级4o模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI识题可用高级4o OCR+工作流</p>
        <p class="info">AI识题可用DeepSeek r1 MIX+工作流</p>
        <p class="info">AI识题默认AAM融合自动增强工作流</p>
        <p class="info">即将可用*AI识题o3-mini GPT工作流</p>
        <p class="info">即将可用*AI识题逻辑o3 GPT工作流</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI笔记使用基础4o mini模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">贴文发布权限</p>
        <div style="height: 20px">&nbsp;</div>
      </div>
    </div>
    <div v-if="smallScreen" class="row" style="overflow-x: auto;min-height: calc(1.7 * 66vw)">
      <div class="card" style="min-width: 66vw;max-width: 66vw;">
        <img alt="vip_rank" src="../../assets/vip/AFA.svg" style="height: 30px"/>
        <p class="card_title">普通授权&nbsp;AFA</p>
        <p class="quota">每月285万额度</p>
        <div style="height: 15px">&nbsp;</div>
        <p class="info">AI对话默认使用基础4o mini模型</p>
        <p class="info">可选高级4o模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI识题可用高级4o OCR+工作流</p>
        <p class="info">AI识题可用DeepSeek r1 MIX+工作流</p>
        <p class="info">AI识题默认AM自动融合工作流</p>
        <p class="info">-</p>
        <p class="info">-</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI笔记使用基础4o mini模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">-</p>
        <div style="height: 20px">&nbsp;</div>
      </div>
      <div class="card" style="min-width: 66vw;max-width: 66vw;">
        <img alt="vip_rank" src="../../assets/vip/AFA+.svg" style="height: 30px"/>
        <p class="card_title">高级授权&nbsp;AFA+</p>
        <p class="quota">每月1140万额度</p>
        <div style="height: 15px">&nbsp;</div>
        <p class="info">AI对话可选基础4o mini模型</p>
        <p class="info">AI对话默认高级4o模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI识题可用高级4o OCR+工作流</p>
        <p class="info">AI识题可用DeepSeek r1 MIX+工作流</p>
        <p class="info">AI识题默认AAM融合自动增强工作流</p>
        <p class="info">即将可用*AI识题o3-mini GPT工作流</p>
        <p class="info">-</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI笔记使用基础4o mini模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">-</p>
        <div style="height: 20px">&nbsp;</div>
      </div>
      <div class="card" style="min-width: 66vw;max-width: 66vw;">
        <img alt="vip_rank" src="../../assets/vip/AFA++.svg" style="height: 30px"/>
        <p class="card_title">超级授权&nbsp;AFA++</p>
        <p class="quota">每月0.513亿额度</p>
        <div style="height: 15px">&nbsp;</div>
        <p class="info">AI对话可选基础4o mini模型</p>
        <p class="info">AI对话默认高级4o模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI识题可用高级4o OCR+工作流</p>
        <p class="info">AI识题可用DeepSeek r1 MIX+工作流</p>
        <p class="info">AI识题默认AAM融合自动增强工作流</p>
        <p class="info">即将可用*AI识题o3-mini GPT工作流</p>
        <p class="info">即将可用*AI识题逻辑o3 GPT工作流</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">AI笔记使用基础4o mini模型</p>
        <div style="height: 8px">&nbsp;</div>
        <p class="info">贴文发布权限</p>
        <div style="height: 20px">&nbsp;</div>
      </div>
      <div style="min-width: 10px"></div>
    </div>
    <div style="display: flex;flex-direction: column;align-items: center;margin-top: 10px;">
      <p class="card_title">输入授权码兑换高级功能授权</p>
      <input style="width: 320px;text-align: center;margin-top: 5px" v-model="auth">
      <button @click="alt=`您确定要对账号：<br>`+getLocalData(`id`)+`<br>使用此授权码吗？`"
              style="width: 342px;margin: 10px;background: linear-gradient(#fdc385,#f3cda3);color: #714106;border: none">
        验证并兑换
      </button>
    </div>
    <div style="display: flex;flex-direction: column;align-items: center;max-width: calc(100% - 50px);margin: 25px">
      <p class="card_title">您现行的授权计划</p>
      <div v-for="(afa,i) in afaList" :key="i" class="auth_card">
        <p v-if="afa.rank==2" class="quota" >普通授权<img alt="vip_rank" src="../../assets/vip/AFA.svg" style="height: 18px;"/></p>
        <p v-if="afa.rank==4" class="quota">高级授权<img alt="vip_rank" src="../../assets/vip/AFA+.svg" style="height: 18px;"/></p>
        <p v-if="afa.rank==6" class="quota">超级授权<img alt="vip_rank" src="../../assets/vip/AFA++.svg" style="height: 18px;"/></p>
        <p>剩余额度：{{afa.quota}}</p>
        <p>{{afa.start_time}} ~ {{afa.end_time}}</p>
      </div>
      <div v-if="afaList.length==0">
        暂未查找到您现行的授权计划，如需获取授权可加站长微信：13023878240
      </div>


    </div>
    <div style="display: flex;flex-direction: column;align-items: center;max-width: calc(100% - 50px);margin: 25px">
      <p class="card_title">了解高级功能授权</p>
      <p class="quota" style="margin-top: 10px">高级功能授权存在的意义</p>
      <p class="info">本网站是个人维护网站，高级功能授权的作用在于限制流量，保障网站的正常运行。</p>
      <p class="quota">高级功能授权的获取方法</p>
      <p class="info">高级功能授权由站长给予，需要与站长沟通获得，站内不存在营业行为，授权资格通过授权码兑换。</p>
      <p class="quota">使用各种模型的额度花费</p>
      <p class="info">
        基础4o mini的额度使用/输入token倍率为1倍；<br>
        基础4o mini的额度使用/输出token倍率为4倍。<br>
        深度思考r1的额度使用/输入token倍率为4倍；<br>
        深度思考r1的额度使用/输出token倍率为15倍；<br>
        高级4o的额度使用/输入token倍率为18倍；<br>
        高级4o的额度使用/输出token倍率为70倍。<br>
        逻辑增强o3 mini的额度使用/输入token倍率为20倍；<br>
        逻辑增强o3 mini的额度使用/输出token倍率为80倍；<br>
        逻辑增强o3的额度使用/输入token倍率为100倍；<br>
        逻辑增强o3的额度使用/输出token倍率为400倍；<br>
      </p>
      <p class="quota">Advanced Auto MIX(AAM)融合自动增强工作流</p>
      <p class="info">使用较低清晰度的图片上传给大模型，通过OCR对高清图像进行识别并添加进prompt，并智能选择：DeepSeek R1 GPT+/o3-mini GPT+/4o OCR+工作流为用户提供最稳定、最准确、最具性价比的回答。拥有目前行业中最高的AI多模态识别准确率，并能至高降低额度使用量56%.</p>
      <p class="quota">OCR+工作流</p>
      <p class="info">使用OCR识别图像内容生成文字，再交给大语言模型，结合文字识别图片内容，以增强题目内容识别准确度，目前OCR+工作流都已支持融合功能。</p>
      <p class="quota">逻辑增强 GPT+工作流</p>
      <p class="info">使用OCR识别图像内容生成文字，再将图片和文字交给大语言多模态模型，再次识别增强整理描述题目内容，最后由逻辑增强模型识别做题。工作流将分别计算大语言模型的token使用量，以及逻辑增强模型的token使用量，最后扣减您的可用额度。目前GPT+工作流都已支持融合功能。</p>
      <p class="quota">*即将可用</p>
      <p class="info">等待本网站对相应内容做出适配后可用，也有可能会被取消</p>
    </div>
    <div style="min-height: 10vh"></div>
  </div>
  <super_alert @cancel="alt=''" @check="check(auth)" v-if="alt!=''" :info="alt"/>
</template>

<style scoped>
.card_title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.quota {
  font-size: 16px;
  font-weight: bold;
}

.info {
  font-size: 14px;
  text-align: center;
  line-height: 18px;
  margin-bottom: 4px;
}

h1 {
  text-align: center;
  font-size: 1.5rem;
  color: rgb(33, 53, 71);
  padding: 0;
  margin: 17px 0 8px;
}

.en {
  text-align: center;
  font-size: 0.80rem;
  color: rgba(28, 28, 28, 0.5);
  padding: 0;
  margin: 0;
}

.row {
  display: flex;
  flex-direction: row;
  max-width: 999px;
  width: 100%;
  margin: 0 auto;
}
.auth_card {
  padding: 10px;
  margin: 10px 10px  0 10px;
  width: calc(100% / 3 - 20px);
  min-width: 280px;
  border-radius: 10px;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card {
  padding: 10px;
  margin: 10px;
  width: calc(100% / 3 - 20px);
  border-radius: 10px;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: fit-content;
}

input:hover,
input:focus {
  border: #5a5a5a 1px solid;
  box-shadow: 0 0 8px rgba(253, 195, 133, 0.2);
}
</style>