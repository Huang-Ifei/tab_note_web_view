<template>
  <div class="manage-container">
    <div class="title-bar">
      <img class="back-btn" src="../../assets/arrow_back.svg" alt="返回" @click="router.push('/ai_classes')" />
      <h1 class="title-text">教师管理</h1>
    </div>

    <div style="min-height: 65px"></div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title">教师列表</h2>
        <div class="add-btn" @click="openCreateModal">+ 新建</div>
      </div>

      <div v-if="teacherList.length === 0 && !isLoading" class="empty-tip">暂无教师数据</div>

      <div v-for="teacher in teacherList" :key="teacher.teacher_id" class="item-card">
        <div class="item-info">
          <h3>{{ teacher.usr_id }}</h3>
          <p v-if="teacher.title">职称: {{ teacher.title }}</p>
          <p class="item-meta">创建时间: {{ teacher.create_time }}</p>
        </div>
        <div class="item-actions">
          <span class="action-btn edit" @click="openEditModal(teacher)">编辑</span>
          <span class="action-btn delete" @click="deleteTeacher(teacher.teacher_id)">删除</span>
        </div>
      </div>

      <div v-if="isLoading" class="loading-tip">加载中...</div>
    </div>

    <!-- 创建/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <h3>{{ isEditing ? '编辑教师' : '新建教师' }}</h3>
        <div class="form-group">
          <label>教师用户ID</label>
          <input v-model="form.usr_id" placeholder="请输入教师用户ID" :disabled="isEditing" />
        </div>
        <div class="form-group">
          <label>职称</label>
          <input v-model="form.title" placeholder="如：教授、讲师（选填）" />
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="showModal = false">取消</button>
          <button class="btn-confirm" @click="submitForm">{{ isEditing ? '保存' : '创建' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import router from '../../router'
import { getAddress } from '../../operation/address.ts'
import { getLocalData, getTokenData } from '../../operation/dataOperation.ts'
import axios from 'axios'

const teacherList = ref<any[]>([])
const isLoading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const editingTeacherId = ref('')
const form = ref({ usr_id: '', title: '' })

async function request(url: string, data: any) {
  const tk = await getTokenData()
  return axios.post(getAddress() + url, {
    usr_id: getLocalData('id'),
    token: tk,
    ...data
  })
}

async function loadTeachers() {
  isLoading.value = true
  try {
    const res = await request('/classManage/teacherList', { index: 0 })
    if (res.data?.success) {
      teacherList.value = res.data.teachers || []
    }
  } catch (e) {
    console.error('加载教师列表失败', e)
  } finally {
    isLoading.value = false
  }
}

function openCreateModal() {
  isEditing.value = false
  editingTeacherId.value = ''
  form.value = { usr_id: '', title: '' }
  showModal.value = true
}

function openEditModal(teacher: any) {
  isEditing.value = true
  editingTeacherId.value = teacher.teacher_id
  form.value = { usr_id: teacher.usr_id, title: teacher.title || '' }
  showModal.value = true
}

async function submitForm() {
  if (!form.value.usr_id.trim()) return
  try {
    const res = isEditing.value
      ? await request('/classManage/updateTeacher', {
          teacher_id: editingTeacherId.value,
          title: form.value.title
        })
      : await request('/classManage/createTeacher', {
          teacher_usr_id: form.value.usr_id,
          title: form.value.title
        })
    if (res.data?.success) {
      showModal.value = false
      await loadTeachers()
    } else {
      alert(res.data?.message || '操作失败')
    }
  } catch (e) {
    alert('请求失败')
  }
}

async function deleteTeacher(teacherId: string) {
  if (!confirm('确定要删除该教师吗？')) return
  try {
    const res = await request('/classManage/deleteTeacher', { teacher_id: teacherId })
    if (res.data?.success) {
      await loadTeachers()
    } else {
      alert(res.data?.message || '删除失败')
    }
  } catch (e) {
    alert('请求失败')
  }
}

onMounted(() => {
  loadTeachers()
})
</script>

<style scoped>
.manage-container {
  min-width: 100vw;
  max-width: 100vw;
  min-height: 100vh;
  background-color: #f5f5f5;
  overflow: scroll;
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
  user-select: none;
}

.title-text {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.section {
  margin-bottom: 20px;
  background-color: white;
  padding: 12px;
  margin-left: 20px;
  margin-right: 20px;
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
}

.item-meta {
  font-size: 12px !important;
  color: #999 !important;
  margin-top: 4px !important;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #555;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
}

.form-group input:focus {
  border-color: #3b82f6;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.btn-cancel {
  padding: 8px 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  cursor: pointer;
  font-size: 14px;
}

.btn-confirm {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.btn-confirm:hover {
  background: #2563eb;
}
</style>
