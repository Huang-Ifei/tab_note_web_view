<template>
  <div class="page-container">
    <div class="title-bar">
      <img class="back-btn" src="../../assets/arrow_back.svg" alt="返回" @click="router.back()" />
      <h1 class="title-text">{{ mode === 'teacher' ? '作业详情' : (mode === 'student_submit' ? '提交作业' : '我的成绩') }}</h1>
    </div>

    <div style="min-height: 65px"></div>

    <div v-if="homework" class="section">
      <h2 class="hw-title">{{ homework.title }}</h2>
      <p v-if="homework.description" class="hw-desc">{{ homework.description }}</p>
      <div class="hw-meta">
        <span>截止: {{ homework.deadline }}</span>
        <span>总分: {{ homework.total_score }}</span>
        <span v-if="mode !== 'teacher' && submission" class="meta-score">
          {{ submission.graded ? '得分: ' + submission.total_score : '待批改' }}
          <span v-if="submission.is_late" style="color: #d93025;"> (迟交)</span>
        </span>
      </div>
    </div>

    <div v-if="isLoading" class="loading-tip">加载中...</div>

    <div v-for="(q, idx) in displayQuestions" :key="q.question_id || idx" class="section question-section">
      <div class="q-header">
        <span class="q-index">第{{ idx + 1 }}题</span>
        <span class="q-type">{{ typeLabel(q.question_type || q.type) }}</span>
        <span class="q-score">{{ q.question_score || q.score }}分</span>
      </div>
      <div class="q-content">{{ q.question_content || q.content }}</div>

      <!-- Teacher view: shows reference answer -->
      <template v-if="mode === 'teacher'">
        <div v-if="q.question_options || q.options" class="q-options">
          <div v-for="opt in parseOptions(q.question_options || q.options)" :key="opt" class="q-option">{{ opt }}</div>
        </div>
        <div class="q-answer">参考答案: {{ q.question_answer || q.answer }}</div>
        <div class="q-actions">
          <span class="action-btn delete" @click="deleteQuestion(q.question_id)">删除题目</span>
        </div>
      </template>

      <!-- Student submit view -->
      <template v-if="mode === 'student_submit'">
        <div v-if="q.question_type === 'single_choice'" class="q-choices">
          <div v-for="opt in parseOptions(q.question_options)" :key="opt"
               class="choice-item" :class="{ active: studentAnswers[q.question_id] === getOptionLetter(opt) }"
               @click="selectOption(q.question_id, opt)">
            <span class="indicator radio-indicator"></span>
            <span class="choice-text">{{ opt }}</span>
          </div>
        </div>
        <div v-if="q.question_type === 'multiple_choice'" class="q-choices">
          <div v-for="opt in parseOptions(q.question_options)" :key="opt"
               class="choice-item" :class="{ active: isSelectedOption(q.question_id, getOptionLetter(opt)) }"
               @click="selectOption(q.question_id, opt)">
            <span class="indicator checkbox-indicator">
              <svg v-if="isSelectedOption(q.question_id, getOptionLetter(opt))" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            <span class="choice-text">{{ opt }}</span>
          </div>
        </div>
        <div v-if="q.question_type === 'fill_blank' || q.question_type === 'code'" class="form-group">
          <textarea v-model="studentAnswers[q.question_id]" :placeholder="q.question_type === 'code' ? '请输入代码' : '请输入答案'" rows="4"></textarea>
        </div>
      </template>

      <!-- Student view (submitted): shows result -->
      <template v-if="mode === 'student_view'">
        <div v-if="q.question_options" class="q-options">
          <div v-for="opt in parseOptions(q.question_options)" :key="opt" class="q-option" :class="{ correct: isCorrectOption(opt, q.question_answer), wrong: q.student_answer && isWrongOption(opt, q.student_answer, q.question_type) }">{{ opt }}</div>
        </div>
        <div class="q-answer">你的答案: {{ q.student_answer || '未作答' }}</div>
        <div v-if="q.question_answer" class="q-answer ref-answer">参考答案: {{ q.question_answer }}</div>
        <div v-if="q.score !== null" class="q-result">
          得分: {{ q.score }} / {{ q.question_score }}
          <span v-if="q.is_correct === 1" class="correct-tag">正确</span>
          <span v-if="q.is_correct === 0" class="wrong-tag">错误</span>
          <span v-if="q.is_correct === null" class="pending-tag">待批改</span>
        </div>
      </template>
    </div>

    <div v-if="mode === 'student_submit'" class="submit-bar">
      <button class="btn-submit" @click="submitHomework" :disabled="isSubmitting">
        {{ isSubmitting ? '提交中...' : '提交作业' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '../../router'
import { getAddress } from '../../operation/address.ts'
import { getLocalData, getTokenData } from '../../operation/dataOperation.ts'
import axios from 'axios'

const route = useRoute()
const homeworkId = typeof route.query.homework_id === 'string' ? route.query.homework_id : ''
const mode = (typeof route.query.mode === 'string' ? route.query.mode : 'teacher') as 'teacher' | 'student_submit' | 'student_view'

const homework = ref<any>(null)
const questions = ref<any[]>([])
const submission = ref<any>(null)
const studentAnswers = reactive<Record<string, string>>({})
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

function getOptionLetter(opt: string): string {
  return opt.charAt(0)
}

function isSelectedOption(questionId: string, letter: string): boolean {
  return (studentAnswers[questionId] || '').split(',').includes(letter)
}

const displayQuestions = computed(() => {
  if (mode === 'student_view' && submission.value?.answers) {
    return submission.value.answers
  }
  return questions.value.map(q => ({
    question_type: q.type,
    question_content: q.content,
    question_options: q.options,
    question_answer: q.answer,
    question_score: q.score,
    question_id: q.question_id,
  }))
})

function selectOption(questionId: string, opt: string) {
  const letter = getOptionLetter(opt)
  const q = questions.value.find((q: any) => q.question_id === questionId)
  if (q?.type === 'multiple_choice' || q?.question_type === 'multiple_choice') {
    const current = studentAnswers[questionId] || ''
    const letters = current ? current.split(',') : []
    const idx = letters.indexOf(letter)
    if (idx >= 0) letters.splice(idx, 1)
    else letters.push(letter)
    letters.sort()
    studentAnswers[questionId] = letters.join(',')
  } else {
    studentAnswers[questionId] = letter
  }
}

function isCorrectOption(opt: string, answer: string): boolean {
  return opt.charAt(0) === answer?.charAt(0) || (answer || '').split(',').includes(opt.charAt(0))
}

function isWrongOption(opt: string, studentAnswer: string, qType: string): boolean {
  if (!studentAnswer) return false
  const answerLetters = studentAnswer.split(',')
  const optLetter = opt.charAt(0)
  if (qType === 'multiple_choice') {
    return answerLetters.includes(optLetter)
  }
  return optLetter === studentAnswer
}

async function loadData() {
  isLoading.value = true
  try {
    const res = await request('/homeworkManage/homeworkDetail', { homework_id: homeworkId })
    if (res.data?.success) {
      homework.value = res.data.homework
      questions.value = res.data.questions || []
    }

    if (mode === 'student_view') {
      const subRes = await request('/homeworkManage/mySubmission', { homework_id: homeworkId })
      if (subRes.data?.success) {
        submission.value = subRes.data.submission
      }
    }
  } catch (e) {
    console.error('加载失败', e)
  } finally {
    isLoading.value = false
  }
}

async function submitHomework() {
  if (questions.value.length === 0) return
  for (const q of questions.value) {
    if (!studentAnswers[q.question_id]?.trim()) {
      alert('请完成所有题目后再提交')
      return
    }
  }
  if (!confirm('确定提交作业？提交后不可修改。')) return

  isSubmitting.value = true
  try {
    const answers = questions.value.map((q: any) => ({
      question_id: q.question_id,
      student_answer: studentAnswers[q.question_id] || ''
    }))
    const res = await request('/homeworkManage/submitHomework', {
      homework_id: homeworkId,
      answers: JSON.stringify(answers)
    })
    if (res.data?.success) {
      router.back()
    } else {
      alert(res.data?.message || '提交失败')
    }
  } catch (e) {
    alert('请求失败')
  } finally {
    isSubmitting.value = false
  }
}

async function deleteQuestion(questionId: string) {
  if (!confirm('确定删除该题目？')) return
  try {
    const res = await request('/homeworkManage/deleteQuestion', { question_id: questionId })
    if (res.data?.success) {
      await loadData()
    } else {
      alert(res.data?.message || '删除失败')
    }
  } catch (e) {
    alert('请求失败')
  }
}

onMounted(() => {
  loadData()
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

.hw-title { font-size: 18px; font-weight: bold; color: #333; margin: 0 0 8px 0; }
.hw-desc { font-size: 14px; color: #666; margin: 0 0 8px 0; }
.hw-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; color: #999; }
.meta-score { color: #3b82f6; font-weight: bold; }

.question-section { margin-bottom: 12px; }
.q-header { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.q-index { font-weight: bold; color: #333; font-size: 14px; }
.q-type { background: #e0f0ff; color: #1a73e8; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
.q-score { color: #f59e0b; font-size: 13px; }
.q-content { font-size: 14px; color: #444; white-space: pre-wrap; margin-bottom: 8px; }

.q-options { display: flex; flex-direction: column; gap: 6px; margin: 6px 0; }
.q-option { font-size: 13px; color: #666; padding: 6px 10px; background: #f5f5f5; border-radius: 6px; }
.q-option.correct { background: #e6f4ea; color: #1e8e3e; border: 1px solid #a8dab5; }
.q-option.wrong { background: #fce8e6; color: #d93025; border: 1px solid #f5b7b1; }

.q-choices { display: flex; flex-direction: column; gap: 10px; margin: 10px 0; }

.choice-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border: 1.5px solid #e0e0e0; border-radius: 10px;
  cursor: pointer; transition: all 0.2s; user-select: none; background: #fafafa;
}
.choice-item:hover { border-color: #93c5fd; background: #f0f7ff; }
.choice-item.active { border-color: #3b82f6; background: #eff6ff; }

.indicator { flex-shrink: 0; display: flex; align-items: center; justify-content: center; }

.radio-indicator {
  width: 20px; height: 20px; border-radius: 50%; border: 2px solid #ccc; transition: all 0.2s;
}
.choice-item.active .radio-indicator {
  border-color: #3b82f6; border-width: 6px;
}

.checkbox-indicator {
  width: 20px; height: 20px; border-radius: 5px; border: 2px solid #ccc; transition: all 0.2s;
}
.checkbox-indicator svg { width: 14px; height: 14px; color: white; }
.choice-item.active .checkbox-indicator {
  border-color: #3b82f6; background: #3b82f6;
}

.choice-text { font-size: 15px; color: #333; line-height: 1.4; }

.q-answer { font-size: 13px; color: #666; margin-top: 6px; padding: 6px 10px; background: #f9f9f9; border-radius: 6px; }
.ref-answer { color: #1e8e3e; }
.q-result { font-size: 13px; margin-top: 6px; color: #333; }

.correct-tag { background: #e6f4ea; color: #1e8e3e; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 8px; }
.wrong-tag { background: #fce8e6; color: #d93025; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 8px; }
.pending-tag { background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 8px; }

.q-actions { display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end; }
.action-btn { font-size: 13px; cursor: pointer; padding: 4px 10px; border-radius: 6px; user-select: none; }
.action-btn.delete { background-color: #fde8e8; color: #d93025; }

.form-group { margin: 8px 0; }
.form-group textarea {
  width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px;
  font-size: 14px; box-sizing: border-box; outline: none; min-height: 80px; resize: vertical;
  font-family: 'Courier New', monospace;
}
.form-group textarea:focus { border-color: #3b82f6; }

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

.loading-tip { text-align: center; color: #999; padding: 40px 0; }
</style>
