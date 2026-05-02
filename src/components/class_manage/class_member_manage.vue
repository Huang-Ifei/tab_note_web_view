<template>
  <div class="manage-container">
    <div class="title-bar">
      <img class="back-btn" src="../../assets/arrow_back.svg" alt="返回" @click="router.push('/class_manage')" />
      <h1 class="title-text">{{ className || '班级成员管理' }}</h1>
    </div>

    <div style="min-height: 65px"></div>

    <!-- 教师列表 -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">班级教师 ({{ teacherList.length }})</h2>
      </div>

      <div v-if="teacherList.length === 0 && !isLoading" class="empty-tip">暂无教师</div>

      <div v-for="teacher in teacherList" :key="teacher.teacher_id" class="item-card">
        <div class="item-info">
          <h3>{{ teacher.user_name }}</h3>
          <p v-if="teacher.title">职称: {{ teacher.title }}</p>
          <p class="item-meta">创建时间: {{ teacher.create_time }}</p>
        </div>
      </div>
    </div>

    <!-- 学生列表 -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">班级学生 ({{ studentList.length }})</h2>
        <div class="header-actions">
          <div class="add-btn" @click="downloadClassTemplate">下载模板</div>
          <div class="add-btn" @click="triggerBatchUpload">批量添加</div>
          <div class="add-btn" @click="openAddStudentModal">+ 添加学生</div>
        </div>
      </div>

      <input ref="batchFileRef" type="file" accept=".xlsx" style="display:none" @change="handleBatchUpload" />

      <div v-if="studentList.length === 0 && !isLoading" class="empty-tip">暂无学生</div>

      <div v-for="student in studentList" :key="student.student_id" class="item-card">
        <div class="item-info">
          <h3>{{ student.user_name }}</h3>
          <p v-if="student.student_no">学号: {{ student.student_no }}</p>
          <p class="item-meta">
            角色: {{ student.role === 'monitor' ? '课代表/班长' : '普通成员' }}
            &nbsp;|&nbsp; 加入时间: {{ student.join_time }}
          </p>
        </div>
        <div class="item-actions">
          <span class="action-btn edit" @click="toggleRole(student)">{{ student.role === 'monitor' ? '设为普通成员' : '设为课代表' }}</span>
          <span class="action-btn delete" @click="removeStudent(student.usr_id)">移除</span>
        </div>
      </div>
    </div>
    </div>

    <div v-if="isLoading" class="loading-tip">加载中...</div>

    <!-- 添加学生弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <h3>添加学生到班级</h3>
        <div class="form-group">
          <label>学生学号</label>
          <input v-model="addForm.student_no" placeholder="请输入学生学号" />
        </div>
        <div class="form-group">
          <label>角色</label>
          <select v-model="addForm.role">
            <option value="member">普通成员</option>
            <option value="monitor">课代表/班长</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="showAddModal = false">取消</button>
          <button class="btn-confirm" @click="addStudent">添加</button>
        </div>
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
const className = ref('')
const studentList = ref<any[]>([])
const teacherList = ref<any[]>([])
const isLoading = ref(false)
const showAddModal = ref(false)
const addForm = ref({ student_no: '', role: 'member' })
const batchFileRef = ref<HTMLInputElement | null>(null)

async function request(url: string, data: any) {
  const tk = await getTokenData()
  return axios.post(getAddress() + url, {
    usr_id: getLocalData('id'),
    token: tk,
    ...data
  })
}

async function loadClassInfo() {
  if (!classId) return
  try {
    const res = await request('/classManage/classDetail', { class_id: classId })
    if (res.data?.success) {
      className.value = res.data.class?.class_name || ''
    }
  } catch (e) {
    console.error('加载班级信息失败', e)
  }
}

async function loadStudents() {
  if (!classId) return
  isLoading.value = true
  try {
    const res = await request('/classManage/classStudents', { class_id: classId })
    if (res.data?.success) {
      studentList.value = res.data.students || []
    }
  } catch (e) {
    console.error('加载学生列表失败', e)
  } finally {
    isLoading.value = false
  }
}

async function loadTeachers() {
  if (!classId) return
  try {
    const res = await request('/classManage/classTeachers', { class_id: classId })
    if (res.data?.success) {
      teacherList.value = res.data.teachers || []
    }
  } catch (e) {
    console.error('加载教师列表失败', e)
  }
}

function openAddStudentModal() {
  addForm.value = { student_no: '', role: 'member' }
  showAddModal.value = true
}

async function addStudent() {
  if (!addForm.value.student_no.trim()) return
  try {
    const res = await request('/classManage/addStudentToClass', {
      class_id: classId,
      student_no: addForm.value.student_no,
      role: addForm.value.role
    })
    if (res.data?.success) {
      showAddModal.value = false
      await loadStudents()
    } else {
      alert(res.data?.message || '添加失败')
    }
  } catch (e) {
    alert('请求失败')
  }
}

async function removeStudent(studentUsrId: string) {
  if (!confirm('确定要将该学生移出班级吗？')) return
  try {
    const res = await request('/classManage/removeStudentFromClass', {
      class_id: classId,
      student_usr_id: studentUsrId
    })
    if (res.data?.success) {
      await loadStudents()
    } else {
      alert(res.data?.message || '移除失败')
    }
  } catch (e) {
    alert('请求失败')
  }
}

async function toggleRole(student: any) {
  const newRole = student.role === 'monitor' ? 'member' : 'monitor'
  try {
    const res = await request('/classManage/updateStudentRole', {
      class_id: classId,
      student_usr_id: student.usr_id,
      role: newRole
    })
    if (res.data?.success) {
      student.role = newRole
    } else {
      alert(res.data?.message || '修改失败')
    }
  } catch (e) {
    alert('请求失败')
  }
}

function downloadClassTemplate() {
  window.open(getAddress() + '/classManage/downloadStudentClassTemplate')
}

function triggerBatchUpload() {
  batchFileRef.value?.click()
}

async function handleBatchUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  try {
    const tk = await getTokenData()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('usr_id', getLocalData('id'))
    formData.append('token', tk)
    formData.append('class_id', classId)
    const res = await axios.post(getAddress() + '/classManage/batchAddStudentsToClass', formData)
    const data = res.data
    if (data?.success) {
      alert(`批量添加完成：成功 ${data.success_count}，失败 ${data.fail_count}`)
    } else {
      alert(data?.message || '操作失败')
    }
    await loadStudents()
  } catch (e) {
    alert('上传失败')
  }
  target.value = ''
}

onMounted(async () => {
  await loadClassInfo()
  await Promise.all([loadStudents(), loadTeachers()])
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
}

.form-group input:focus,
.form-group select:focus {
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
