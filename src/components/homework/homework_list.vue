<template>
  <div class="page-container">
    <div class="title-bar">
      <img class="back-btn" src="../../assets/arrow_back.svg" alt="返回" @click="router.back()" />
      <h1 class="title-text">{{ className || '课堂作业' }}</h1>
    </div>

    <div style="min-height: 65px"></div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title">作业列表</h2>
        <div v-if="isTeacher" class="add-btn" @click="router.push('/homework_create?class_id=' + classId)">+ 新建作业</div>
      </div>

      <div v-if="homeworkList.length === 0 && !isLoading" class="empty-tip">暂无作业</div>

      <div v-for="hw in homeworkList" :key="hw.homework_id" class="item-card">
        <div class="item-info" @click="handleHomeworkClick(hw)">
          <h3>{{ hw.title }}</h3>
          <p v-if="hw.description">{{ hw.description }}</p>
          <div class="item-meta-row">
            <span>截止: {{ hw.deadline }}</span>
            <span>总分: {{ hw.total_score }}</span>
            <span v-if="hw.submitted !== undefined" class="status-tag" :class="hw.submitted ? 'submitted' : 'not-submitted'">
              {{ hw.submitted ? (hw.graded ? '已评分 ' + hw.my_score + '分' : '待批改') : '未提交' }}
            </span>
          </div>
        </div>
        <div v-if="isTeacher" class="item-actions">
          <span class="action-btn submissions" @click="router.push('/homework_submissions?homework_id=' + hw.homework_id)">批改作业</span>
          <span class="action-btn edit" @click="router.push('/homework_create?class_id=' + classId + '&homework_id=' + hw.homework_id)">编辑</span>
          <span class="action-btn delete" @click="deleteHomework(hw.homework_id)">删除</span>
        </div>
      </div>

      <div v-if="isLoading" class="loading-tip">加载中...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '../../router'
import { getAddress } from '../../operation/address.ts'
import { getLocalData, getTokenData } from '../../operation/dataOperation.ts'
import axios from 'axios'

const route = useRoute()
const classId = typeof route.query.class_id === 'string' ? route.query.class_id : ''
const homeworkList = ref<any[]>([])
const isLoading = ref(false)
const isTeacher = ref(false)
const className = ref('')

async function request(url: string, data: any) {
  const tk = await getTokenData()
  return axios.post(getAddress() + url, {
    usr_id: getLocalData('id'),
    token: tk,
    ...data
  })
}

async function checkRank() {
  try {
    const tk = await getTokenData()
    const res = await axios.get(getAddress() + '/vip/rank?id=' + getLocalData('id'), { headers: { token: tk } })
    isTeacher.value = res.data.rank >= 10
  } catch (e) {
    console.error(e)
  }
}

async function loadHomeworkList() {
  isLoading.value = true
  try {
    let res: any
    if (isTeacher.value) {
      res = await request('/homeworkManage/classHomeworkList', { class_id: classId, index: 0 })
    } else {
      res = await request('/homeworkManage/myHomeworkList', { class_id: classId, index: 0 })
    }
    if (res.data?.success) {
      homeworkList.value = res.data.homework_list || []
    }
  } catch (e) {
    console.error('加载作业列表失败', e)
  } finally {
    isLoading.value = false
  }
}

async function loadClassName() {
  try {
    const res = await request('/classManage/studentClasses', { student_usr_id: getLocalData('id') })
    if (res.data?.success) {
      const cls = (res.data.classes || []).find((c: any) => c.class_id === classId)
      if (cls) className.value = cls.class_name
    }
  } catch (e) {
    try {
      const res2 = await request('/classManage/classList', { index: 0 })
      if (res2.data?.success) {
        const cls = (res2.data.classes || []).find((c: any) => c.class_id === classId)
        if (cls) className.value = cls.class_name
      }
    } catch (e2) {
      console.error(e2)
    }
  }
}

function handleHomeworkClick(hw: any) {
  if (isTeacher.value) {
    router.push('/homework_detail?homework_id=' + hw.homework_id + '&mode=teacher')
  } else {
    if (hw.submitted) {
      router.push('/homework_detail?homework_id=' + hw.homework_id + '&mode=student_view')
    } else {
      router.push('/homework_detail?homework_id=' + hw.homework_id + '&mode=student_submit')
    }
  }
}

async function deleteHomework(homeworkId: string) {
  if (!confirm('确定删除该作业？此操作不可撤销。')) return
  try {
    const res = await request('/homeworkManage/deleteHomework', { homework_id: homeworkId })
    if (res.data?.success) {
      await loadHomeworkList()
    } else {
      alert(res.data?.message || '删除失败')
    }
  } catch (e) {
    alert('请求失败')
  }
}

onMounted(async () => {
  await checkRank()
  await Promise.all([loadHomeworkList(), loadClassName()])
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

.section {
  margin: 20px;
  background-color: white;
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.add-btn {
  padding: 6px 16px;
  border-radius: 8px;
  background-color: #3b82f6;
  color: white;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.add-btn:hover {
  background-color: #2563eb;
}

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.item-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-info {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.item-info h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-info p {
  margin: 0;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta-row {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.status-tag.submitted {
  background-color: #e6f4ea;
  color: #1e8e3e;
}

.status-tag.not-submitted {
  background-color: #fce8e6;
  color: #d93025;
}

.item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
}

.action-btn {
  font-size: 13px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  user-select: none;
}

.action-btn.edit {
  background-color: #e0f0ff;
  color: #1a73e8;
}

.action-btn.delete {
  background-color: #fde8e8;
  color: #d93025;
}

.action-btn.submissions {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.loading-tip {
  text-align: center;
  color: #999;
  padding: 20px 0;
}
</style>
