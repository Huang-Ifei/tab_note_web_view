<template>
  <div class="page-container">
    <div class="title-bar">
      <img class="back-btn" src="../../assets/arrow_back.svg" alt="返回" @click="router.back()" />
      <h1 class="title-text">{{ isEditing ? '编辑作业' : '创建作业' }}</h1>
    </div>

    <div style="min-height: 65px"></div>

    <div class="section">
      <div class="form-group">
        <label>作业标题</label>
        <input v-model="form.title" placeholder="请输入作业标题" />
      </div>
      <div class="form-group">
        <label>作业描述</label>
        <textarea v-model="form.description" placeholder="请输入作业描述（选填）" rows="3"></textarea>
      </div>
      <div class="form-group">
        <label>截止时间</label>
        <input v-model="form.deadline" type="datetime-local" />
      </div>

      <div class="section-divider">
        <span>题目列表</span>
        <div class="add-q-btn" @click="openQuestionModal(null)">+ 添加题目</div>
      </div>

      <div v-if="questions.length === 0" class="empty-tip">暂未添加题目</div>

      <div v-for="(q, idx) in questions" :key="idx" class="question-card">
        <div class="q-header">
          <span class="q-index">第{{ idx + 1 }}题</span>
          <span class="q-type">{{ typeLabel(q.type) }}</span>
          <span class="q-score">{{ q.score }}分</span>
        </div>
        <div class="q-content">{{ q.content }}</div>
        <div v-if="q.type === 'single_choice' || q.type === 'multiple_choice'" class="q-options">
          <div v-for="opt in parseOptions(q.options)" :key="opt" class="q-option">
            {{ opt }}
          </div>
        </div>
        <div v-if="q.type === 'code' && q.auto_grading === 1" class="q-auto-tag">自动评分</div>
        <div class="q-actions">
          <span class="action-btn edit" @click="openQuestionModal(idx)">编辑</span>
          <span class="action-btn delete" @click="removeQuestion(idx)">删除</span>
        </div>
      </div>

      <div class="form-actions" style="margin-top: 20px;">
        <button class="btn-cancel" @click="router.back()">取消</button>
        <button class="btn-confirm" @click="submitHomework" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : (isEditing ? '保存' : '创建') }}
        </button>
      </div>
    </div>

    <!-- 题目弹窗 -->
    <div v-if="showQuestionModal" class="modal-overlay" @click.self="showQuestionModal = false">
      <div class="modal">
        <h3>{{ editingQuestionIndex !== null ? '编辑题目' : '添加题目' }}</h3>
        <div class="form-group">
          <label>题目类型</label>
          <select v-model="questionForm.type" @change="onTypeChange">
            <option value="single_choice">单选题</option>
            <option value="multiple_choice">多选题</option>
            <option value="fill_blank">填空题</option>
            <option value="code">代码题</option>
          </select>
        </div>
        <div class="form-group">
          <label>题目内容</label>
          <textarea v-model="questionForm.content" placeholder="请输入题目内容" rows="3"></textarea>
        </div>
        <div v-if="questionForm.type === 'single_choice' || questionForm.type === 'multiple_choice'" class="form-group">
          <label>选项（每行一个，格式：A.选项内容）</label>
          <textarea v-model="questionForm.optionsText" placeholder="A.选项一&#10;B.选项二&#10;C.选项三&#10;D.选项四" rows="4"></textarea>
        </div>
        <div class="form-group">
          <label>参考答案</label>
          <textarea v-model="questionForm.answer" placeholder="选择题填选项字母如A；多选题如A,C,D；填空题填答案；代码题填参考代码" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>分值</label>
          <input v-model.number="questionForm.score" type="number" min="0" step="1" />
        </div>
        <div v-if="questionForm.type === 'code'" class="form-group">
          <label>
            <input type="checkbox" v-model="questionForm.auto_grading" true-value="1" false-value="0" />
            启用自动评分
          </label>
        </div>
        <div v-if="questionForm.type === 'code' && questionForm.auto_grading === '1'" class="form-group">
          <label>测试用例（每行一个，格式：输入->期望输出）</label>
          <textarea v-model="questionForm.testCasesText" placeholder="3,1,2->1,2,3&#10;5,4,3,2,1->1,2,3,4,5" rows="3"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-cancel" @click="showQuestionModal = false">取消</button>
          <button class="btn-confirm" @click="saveQuestion">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import router from '../../router'
import { getAddress } from '../../operation/address.ts'
import { getLocalData, getTokenData } from '../../operation/dataOperation.ts'
import axios from 'axios'

const route = useRoute()
const classId = typeof route.query.class_id === 'string' ? route.query.class_id : ''
const homeworkId = typeof route.query.homework_id === 'string' ? route.query.homework_id : ''
const isEditing = computed(() => !!homeworkId)
const isSubmitting = ref(false)

const form = ref({ title: '', description: '', deadline: '' })
const questions = ref<any[]>([])
const showQuestionModal = ref(false)
const editingQuestionIndex = ref<number | null>(null)
const questionForm = ref({
  type: 'single_choice',
  content: '',
  optionsText: '',
  answer: '',
  score: 10,
  auto_grading: '0',
  testCasesText: ''
})

async function request(url: string, data: any) {
  const tk = await getTokenData()
  return axios.post(getAddress() + url, { usr_id: getLocalData('id'), token: tk, ...data })
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    single_choice: '单选题', multiple_choice: '多选题', fill_blank: '填空题', code: '代码题'
  }
  return map[type] || type
}

function parseOptions(optionsStr: string): string[] {
  try { return JSON.parse(optionsStr) } catch { return [] }
}

function onTypeChange() {
  questionForm.value.optionsText = ''
  questionForm.value.testCasesText = ''
  questionForm.value.auto_grading = '0'
}

function openQuestionModal(index: number | null) {
  editingQuestionIndex.value = index
  if (index !== null && questions.value[index]) {
    const q = questions.value[index]
    questionForm.value = {
      type: q.type,
      content: q.content,
      optionsText: q.options ? parseOptions(q.options).join('\n') : '',
      answer: q.answer,
      score: q.score,
      auto_grading: q.auto_grading?.toString() || '0',
      testCasesText: q.test_cases ? parseTestCases(q.test_cases).join('\n') : ''
    }
  } else {
    questionForm.value = {
      type: 'single_choice', content: '', optionsText: '', answer: '', score: 10, auto_grading: '0', testCasesText: ''
    }
  }
  showQuestionModal.value = true
}

function parseTestCases(tcStr: string): string[] {
  try {
    const arr = JSON.parse(tcStr)
    return arr.map((tc: any) => `${tc.input}->${tc.expected}`)
  } catch { return [] }
}

function saveQuestion() {
  const q: any = {
    type: questionForm.value.type,
    content: questionForm.value.content,
    answer: questionForm.value.answer,
    score: questionForm.value.score || 0,
    auto_grading: questionForm.value.type === 'code' ? parseInt(questionForm.value.auto_grading) || 0 : 0
  }

  if (questionForm.value.type === 'single_choice' || questionForm.value.type === 'multiple_choice') {
    const opts = questionForm.value.optionsText.trim().split('\n').filter(s => s.trim())
    q.options = JSON.stringify(opts)
  }

  if (questionForm.value.type === 'code' && q.auto_grading === 1 && questionForm.value.testCasesText.trim()) {
    const cases = questionForm.value.testCasesText.trim().split('\n').filter(s => s.trim()).map(line => {
      const parts = line.split('->')
      return { input: (parts[0] || '').trim(), expected: (parts[1] || '').trim() }
    })
    q.test_cases = JSON.stringify(cases)
  }

  if (editingQuestionIndex.value !== null) {
    questions.value[editingQuestionIndex.value] = q
  } else {
    questions.value.push(q)
  }
  showQuestionModal.value = false
}

function removeQuestion(index: number) {
  questions.value.splice(index, 1)
}

function formatDeadline(localDatetime: string): string {
  return localDatetime.replace('T', ' ') + ':00'
}

async function submitHomework() {
  if (!form.value.title.trim()) { alert('请输入作业标题'); return }
  if (!form.value.deadline) { alert('请选择截止时间'); return }
  if (questions.value.length === 0) { alert('请至少添加一道题目'); return }

  isSubmitting.value = true
  try {
    if (isEditing.value) {
      const res = await request('/homeworkManage/updateHomework', {
        homework_id: homeworkId,
        title: form.value.title,
        description: form.value.description,
        deadline: formatDeadline(form.value.deadline)
      })
      if (!res.data?.success) { alert(res.data?.message || '更新失败'); return }
      // Also update questions: delete old and re-add
      const detailRes = await request('/homeworkManage/homeworkDetail', { homework_id: homeworkId })
      if (detailRes.data?.questions) {
        for (const q of detailRes.data.questions) {
          await request('/homeworkManage/deleteQuestion', { question_id: q.question_id })
        }
      }
      for (const q of questions.value) {
        await request('/homeworkManage/addQuestion', { homework_id: homeworkId, ...q })
      }
    } else {
      const res = await request('/homeworkManage/createHomework', {
        class_id: classId,
        title: form.value.title,
        description: form.value.description,
        deadline: formatDeadline(form.value.deadline),
        questions: JSON.stringify(questions.value)
      })
      if (!res.data?.success) { alert(res.data?.message || '创建失败'); return }
    }
    router.back()
  } catch (e) {
    alert('请求失败')
  } finally {
    isSubmitting.value = false
  }
}

async function loadExistingHomework() {
  if (!homeworkId) return
  try {
    const res = await request('/homeworkManage/homeworkDetail', { homework_id: homeworkId })
    if (res.data?.success) {
      const hw = res.data.homework
      form.value.title = hw.title
      form.value.description = hw.description || ''
      form.value.deadline = hw.deadline?.replace(' ', 'T').slice(0, 16) || ''
      questions.value = res.data.questions || []
    }
  } catch (e) {
    console.error('加载作业详情失败', e)
  }
}

onMounted(() => {
  loadExistingHomework()
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

.back-btn { height: 24px; width: 24px; cursor: pointer; margin-right: 12px; }
.title-text { font-size: 20px; font-weight: bold; color: #333; margin: 0; }

.section {
  margin: 20px;
  background-color: white;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 14px; color: #555; margin-bottom: 6px; }
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
}
.form-group input:focus, .form-group textarea:focus, .form-group select:focus { border-color: #3b82f6; }
.form-group textarea { min-height: 60px; resize: vertical; }

.section-divider {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid #e0e0e0;
  margin-top: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.add-q-btn {
  padding: 6px 14px;
  border-radius: 8px;
  background-color: #3b82f6;
  color: white;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
}

.question-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}

.q-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.q-index { font-weight: bold; color: #333; font-size: 14px; }
.q-type { background: #e0f0ff; color: #1a73e8; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.q-score { color: #f59e0b; font-size: 13px; }
.q-content { font-size: 14px; color: #444; white-space: pre-wrap; margin-bottom: 4px; }

.q-options { display: flex; flex-direction: column; gap: 4px; margin: 6px 0; }
.q-option { font-size: 13px; color: #666; padding: 2px 8px; background: #f5f5f5; border-radius: 4px; }
.q-auto-tag { font-size: 12px; color: #1e8e3e; background: #e6f4ea; padding: 2px 8px; border-radius: 10px; display: inline-block; margin-top: 4px; }

.q-actions { display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end; }

.action-btn { font-size: 13px; cursor: pointer; padding: 4px 10px; border-radius: 6px; user-select: none; }
.action-btn.edit { background-color: #e0f0ff; color: #1a73e8; }
.action-btn.delete { background-color: #fde8e8; color: #d93025; }

.empty-tip { text-align: center; color: #999; padding: 30px 0; }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-cancel { padding: 8px 20px; border-radius: 8px; border: 1px solid #ddd; background: white; color: #666; cursor: pointer; font-size: 14px; }
.btn-confirm { padding: 8px 20px; border-radius: 8px; border: none; background: #3b82f6; color: white; cursor: pointer; font-size: 14px; }
.btn-confirm:hover { background: #2563eb; }
.btn-confirm:disabled { background: #93c5fd; cursor: not-allowed; }

.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 1000;
}

.modal {
  background: white; border-radius: 12px; padding: 24px; width: 90%; max-width: 480px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); max-height: 85vh; overflow-y: auto;
}

.modal h3 { margin: 0 0 16px 0; font-size: 18px; color: #333; }
</style>
