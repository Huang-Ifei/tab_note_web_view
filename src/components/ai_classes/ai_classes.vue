<template>
  <div class="ai-classes-container">
    <!-- 半透明标题栏 -->
    <div class="title-bar">
      <h1 class="title-text" @click="router.push('/')">
        TabNote_<span class="gradient-text">AI教学平台</span>
      </h1>
      <div v-if="rank >= 10" class="manage-entry">
        <span v-if="rank === 10" class="manage-btn" @click="router.push('/class_manage')">班级管理</span>
        <span v-if="rank >= 10" class="manage-btn" @click="router.push('/student_manage')">学生管理</span>
        <span v-if="rank >= 12" class="manage-btn" @click="router.push('/teacher_manage')">教师管理</span>
      </div>
    </div>

    <!-- 课堂任务部分 -->
    <div style="min-height: 65px"></div>
<!--    <div class="section" style="">-->
<!--      <h2 class="section-title">课堂任务</h2>-->
<!--      <div class="empty-div"></div>-->
<!--    </div>-->

    <!-- AI知识库部分 -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">AI知识库</h2>
        <div v-if="rank >= 10" class="add-book-btn" @click="router.push('/book_add')">+</div>
      </div>
      <div class="book-list">
        <div v-for="book in bookList" :key="book.book_id" class="book-item">
          <div class="book-cover-container" @click="routerPushBook(book.book_id)">
            <img :src="book.cover_image" :alt="book.book_name" class="book-cover">
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.book_name }}</h3>
            <p class="book-author">作者: {{ book.author }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getAddress } from '../../operation/address.ts';
import { getLocalData, getTokenData } from '../../operation/dataOperation.ts';
import router from "../../router";
import axios from "axios";

const bookList = ref<any[]>([]);
const isLoading = ref(false);
const index = ref(0);
const rank = ref(0);

async function getRank() {
  try {
    const tk = await getTokenData()
    const response = await axios.get(getAddress() + "/vip/rank?id=" + getLocalData("id"), {
      headers: { token: tk }
    })
    rank.value = response.data.rank
  } catch (e) {
    console.error('获取VIP等级失败', e)
  }
}

// 加载书本列表
const loadBooks = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  try {
    const address = getAddress();
    const response = await fetch(`${address}/book/bookList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ index: index.value })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.success && Array.isArray(data.books)) {
        bookList.value = [...bookList.value, ...data.books];
        index.value = bookList.value.length;
      }
    }
  } catch (error) {
    console.error('加载书本列表失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 滚动到底部加载更多
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;
  
  if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading.value) {
    loadBooks();
  }
};

onMounted(() => {
  getRank();
  loadBooks();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

function routerPushBook(bookId:string){
  if (rank.value < 10) {
    router.push('/rag_ai_messages?book_id=' + bookId)
  } else{
    router.push('/book_edit?book_id=' + bookId)
  }
}
</script>

<style scoped>
.ai-classes-container {
  min-width: 100vw;
  max-width: 100vw;
  min-height: 100vh;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: scroll;

}

.title-bar {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  width: calc(100vw - 40px);
  height: calc(54px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.manage-entry {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.manage-btn {
  padding: 4px 12px;
  border-radius: 6px;
  background-color: #e0f0ff;
  color: #1a73e8;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.manage-btn:hover {
  background-color: #c5e2ff;
}

.title-text {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
  cursor: pointer;
}

.gradient-text {
  background: linear-gradient(90deg, #1e3a8a, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

.add-book-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
  flex-shrink: 0;
  user-select: none;
}

.add-book-btn:hover {
  background-color: #2563eb;
}

.empty-div {
  min-height: 200px;
  background-color: #f0f0f0;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.book-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.book-item {
  width: 200px;
  height: 300px;
  display: flex;
  flex-direction: column;
}

.book-cover-container {
  position: relative;
  width: 200px;
  height: 300px;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.book-cover-container:hover {
  transform: translateY(-5px);
}

.book-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  margin-top: 10px;
  padding: 5px;
}

.book-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 5px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  font-size: 12px;
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .book-item {
    flex: 0 0 calc(50% - 10px);
  }
}

@media (max-width: 480px) {
  .book-item {
    flex: 0 0 100%;
  }
}
</style>