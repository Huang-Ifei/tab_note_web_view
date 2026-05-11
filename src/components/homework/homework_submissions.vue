<template>
  <div class="page-container">
    <div class="title-bar">
      <img class="back-btn" src="../../assets/arrow_back.svg" alt="返回" @click="router.back()" />
      <h1 class="title-text">{{ grading ? '评分 - ' + grading.student_name : '提交列表' }}</h1>
    </div>

    <div style="min-height: 65px"></div>

    <!-- Submission list -->
    <div v-if="!grading" class="section">
      <div v-if="submissions.length === 0 && !isLoading" class="empty-tip">暂无提交</div>

      <div v-for="sub in submissions" :key="sub.submission_id" class="item-card">
        <div class="item-info" @click="viewSubmission(sub)">
          <h3>{{ sub.student_name }}</h3>
          <div class="item-meta-row">
            <span>提交时间: {{ sub.submit_time }}</span>
            <span v-if="sub.is_late" class="status-tag late">迟交</span>
            <span v-if="sub.graded" class="status-tag graded">已评分 {{ sub.total_score }}分</span>
            <span v-else class="status-tag pending">待批改</span>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="loading-tip">加载中...</div>
    </div>

    <!-- Grading view -->
    <div v-if="grading">
      <div v-for="(ans, idx) in grading.answers" :key="ans.answer_id" class="section grading-section">
        <div class="q-header">
          <span class="q-index">第{{ idx + 1 }}题</span>
          <span class="q-type">{{ typeLabel(ans.question_type) }}</span>
          <span class="q-score">{{ ans.question_score }}分</span>
        </div>
        <div class="q-content">{{ ans.question_content }}</div>

        <div v-if="ans.question_options" class="q-options">
          <div v-for="opt in parseOptions(ans.question_options)" :key="opt" class="q-option"
               :class="{ correct: isCorrectOption(opt, ans.question_answer), wrong: isWrongOption(opt, ans.student_answer, ans.question_type) }">
            {{ opt }}
          </div>
        </div>

        <div class="answer-row">
          <div class="answer-box">
            <div class="answer-label">学生答案:</div>
            <div class="answer-text student">{{ ans.student_answer || '未作答' }}</div>
          </div>
          <div class="answer-box">
            <div class="answer-label">参考答案:</div>
            <div class="answer-text reference">{{ ans.question_answer || '-' }}</div>
          </div>
        </div>

        <div v-if="ans.question_type === 'single_choice' || ans.question_type === 'multiple_choice'" class="auto-result">
          <span v-if="ans.is_correct === 1" class="correct-tag">自动判定: 正确</span>
          <span v-if="ans.is_correct === 0" class="wrong-tag">自动判定: 错误</span>
        </div>

        <div class="score-input-row">
          <label>给分:</label>
          <input type="number" v-model.number="gradingScores[ans.question_id]"
                 min="0" :max="ans.question_score" step="0.5" class="score-input" />
          <span>/ {{ ans.question_score }}分</span>
        </div>
      </div>

      <div class="submit-bar">
        <button class="btn-submit" @click="submitGrades" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : '提交评分' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '../../router'
import { getAddress } from '../../operation/address.ts'
import { getLocalData, getTokenData } from '../../operation/dataOperation.ts'
import axios from 'axios'

const route = useRoute()
const homeworkId = typeof route.query.homework_id === 'string' ? route.query.homework_id : ''
const submissions = ref<any[]>([])
const grading = ref<any>(null)
const gradingScores = reactive<Record<string, number>>({})
const isLoading = ref(false)
const isSubmitting = ref(false)

async function request(url: string, data: any) {
  const tk = await getTokenData()
  return axios.post(getAddress() + url, { usr_id: getLocalData('id'), token: tk, ...data })
}

function typeLabel(type: string) {
  const map: Record<string, string> = { single_choice: '单选题', multiple_choice: '多选题', fill_blank: '填空题', code: '代码题' }
  return map[type] || type
}

function parseOptions(optionsStr: string): string[] {
  try { return JSON.parse(optionsStr) } catch { return [] }
}

function isCorrectOption(opt: string, answer: string): boolean {
  return (answer || '').split(',').includes(opt.charAt(0))
}

function isWrongOption(opt: string, studentAnswer: string, _qType: string): boolean {
  if (!studentAnswer) return false
  const letters = studentAnswer.split(',')
  return letters.includes(opt.charAt(0))
}

async function loadSubmissions() {
  isLoading.value = true
  try {
    const res = await request('/homeworkManage/getSubmissions', { homework_id: homeworkId })
    if (res.data?.success) {
      submissions.value = res.data.submissions || []
    }
  } catch (e) {
    console.error('加载提交列表失败', e)
  } finally {
    isLoading.value = false
  }
}

async function viewSubmission(sub: any) {
  try {
    const res = await request('/homeworkManage/getStudentAnswer', { submission_id: sub.submission_id })
    if (res.data?.success) {
      grading.value = {
        submission_id: sub.submission_id,
        student_name: sub.student_name,
        answers: res.data.answers || []
      }
      // Pre-fill existing scores
      for (const ans of grading.value.answers) {
        gradingScores[ans.question_id] = ans.score ?? 0
      }
    } else {
      alert(res.data?.message || '加载失败')
    }
  } catch (e) {
    alert('请求失败')
  }
}

async function submitGrades() {
  if (!grading.value) return
  isSubmitting.value = true
  try {
    const scores = grading.value.answers.map((ans: any) => ({
      question_id: ans.question_id,
      score: gradingScores[ans.question_id] || 0
    }))
    const res = await request('/homeworkManage/gradeSubmission', {
      submission_id: grading.value.submission_id,
      scores: JSON.stringify(scores)
    })
    if (res.data?.success) {
      grading.value = null
      await loadSubmissions()
    } else {
      alert(res.data?.message || '评分失败')
    }
  } catch (e) {
    alert('请求失败')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadSubmissions()
})
</script>

<style scoped>
.page-container {
  min-width: 100vw;
  max-width: 100vw;
  min-height: 100vh;
  background-color: #f5f5f5;
  overflow-y: auto;
  padding-bottom: 80px;
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

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.item-info { flex: 1; cursor: pointer; min-width: 0; }
.item-info h3 { margin: 0 0 4px 0; font-size: 15px; color: #333; }
.item-meta-row { display: flex; gap: 12px; font-size: 13px; color: #999; align-items: center; }

.status-tag { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.status-tag.graded { background: #e6f4ea; color: #1e8e3e; }
.status-tag.pending { background: #fff3e0; color: #e65100; }
.status-tag.late { background: #fce8e6; color: #d93025; }

.grading-section { margin-bottom: 12px; }
.q-header { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.q-index { font-weight: bold; color: #333; font-size: 14px; }
.q-type { background: #e0f0ff; color: #1a73e8; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.q-score { color: #f59e0b; font-size: 13px; }
.q-content { font-size: 14px; color: #444; white-space: pre-wrap; margin-bottom: 8px; }

.q-options { display: flex; flex-direction: column; gap: 6px; margin: 6px 0; }
.q-option { font-size: 13px; color: #666; padding: 6px 10px; background: #f5f5f5; border-radius: 6px; }
.q-option.correct { background: #e6f4ea; color: #1e8e3e; border: 1px solid #a8dab5; }
.q-option.wrong { background: #fce8e6; color: #d93025; border: 1px solid #f5b7b1; }

.answer-row { display: flex; gap: 12px; margin: 8px 0; }
.answer-box { flex: 1; }
.answer-label { font-size: 12px; color: #999; margin-bottom: 4px; }
.answer-text { font-size: 13px; padding: 8px; border-radius: 6px; white-space: pre-wrap; word-break: break-all; }
.answer-text.student { background: #f0f4ff; color: #333; }
.answer-text.reference { background: #f0fff0; color: #1e8e3e; }

.auto-result { margin: 6px 0; }
.correct-tag { background: #e6f4ea; color: #1e8e3e; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.wrong-tag { background: #fce8e6; color: #d93025; padding: 2px 8px; border-radius: 10px; font-size: 12px; }

.score-input-row {
  display: flex; align-items: center; gap: 8px; margin-top: 8px;
  font-size: 14px; color: #333;
}
.score-input {
  width: 80px; padding: 6px 10px; border: 1px solid #ddd; border-radius: 8px;
  font-size: 14px; outline: none; text-align: center;
}
.score-input:focus { border-color: #3b82f6; }

.submit-bar {
  position: fixed; bottom: 0; left: 0; width: 100vw; padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1); z-index: 999;
}

.btn-submit {
  width: 100%; padding: 12px; border-radius: 8px; border: none;
  background: #3b82f6; color: white; font-size: 16px; cursor: pointer;
}
.btn-submit:hover { background: #2563eb; }
.btn-submit:disabled { background: #93c5fd; cursor: not-allowed; }

.empty-tip { text-align: center; color: #999; padding: 40px 0; }
.loading-tip { text-align: center; color: #999; padding: 20px 0; }
</style>
