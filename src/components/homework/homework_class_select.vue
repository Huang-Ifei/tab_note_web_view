<template>
  <div class="page-container">
    <div class="title-bar">
      <img class="back-btn" src="../../assets/arrow_back.svg" alt="返回" @click="router.back()" />
      <h1 class="title-text">选择班级</h1>
    </div>

    <div style="min-height: 65px"></div>

    <div class="class-scroll-wrapper">
      <div v-if="classList.length === 0 && !isLoading" class="empty-tip">暂无班级</div>
      <div v-for="cls in classList" :key="cls.class_id" class="class-card" @click="router.push('/homework_list?class_id=' + cls.class_id)">
        <div class="class-card-top">
          <div class="class-icon">{{ cls.class_name.charAt(0) }}</div>
        </div>
        <div class="class-card-bottom">
          <h3>{{ cls.class_name }}</h3>
          <p>{{ cls.description || '' }}</p>
        </div>
      </div>
      <div v-if="isLoading" class="loading-tip">加载中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import router from '../../router'
import { getAddress } from '../../operation/address.ts'
import { getLocalData, getTokenData } from '../../operation/dataOperation.ts'
import axios from 'axios'

const classList = ref<any[]>([])
const isLoading = ref(false)

async function loadClasses() {
  isLoading.value = true
  try {
    const tk = await getTokenData()
    const address = getAddress()
    const body: any = { usr_id: getLocalData('id'), token: tk }

    const rankRes = await axios.get(address + '/vip/rank?id=' + getLocalData('id'), { headers: { token: tk } })
    const rank = rankRes.data.rank
    let res: any
    if (rank >= 10) {
      res = await axios.post(address + '/classManage/classList', { ...body, index: 0 })
    } else {
      res = await axios.post(address + '/classManage/studentClasses', { ...body, student_usr_id: getLocalData('id') })
    }
    if (res.data?.success) {
      classList.value = res.data.classes || []
    }
  } catch (e) {
    console.error('加载班级失败', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadClasses()
})
</script>

<style scoped>
.page-container {
  min-width: 100vw;
  max-width: 100vw;
  min-height: 100vh;
  background-color: #f5f5f5;
  overflow-y: auto;
}

.title-bar {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  width: calc(100vw - 40px);
  height: 54px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.back-btn {
  height: 24px;
  width: 24px;
  cursor: pointer;
  margin-right: 12px;
}

.title-text {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.class-scroll-wrapper {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 16px;
  padding: 20px;
  -webkit-overflow-scrolling: touch;
}

.class-scroll-wrapper::-webkit-scrollbar {
  display: none;
}

.class-card {
  width: 160px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
  overflow: hidden;
}

.class-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.class-card-top {
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.class-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 22px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.class-card-bottom {
  padding: 10px;
}

.class-card-bottom h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.class-card-bottom p {
  margin: 0;
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 60px 0;
  width: 100%;
}

.loading-tip {
  text-align: center;
  color: #999;
  padding: 20px;
  white-space: nowrap;
}
</style>
