<template>
  <div class="ai-classes-container">
    <!-- 半透明标题栏 -->
    <div class="title-bar">
      <img class="back-btn" src="../../assets/arrow_back.svg" alt="返回" @click="router.push('/ai_classes')" />
      <h1 class="title-text">
        新增书本</h1>
    </div>

    <div class="book-detail-container" style="margin-top: 80px;">
      <div class="book-cover">
        <img :src="data.book.cover_image" alt="封面" v-if="data.book && data.book.cover_image" />
      </div>
      
      <div class="book-info-item">
        <label>书名：</label>
        <input v-if="editing.name" v-model="data.book.book_name" type="text" class="edit-input" />
        <span v-else @click="startEditing('name')">{{data.book.book_name}}</span>
      </div>
      
      <div class="book-info-item">
        <label>作者：</label>
        <input v-if="editing.author" v-model="data.book.author" type="text" class="edit-input" />
        <span v-else @click="startEditing('author')">{{data.book.author}}</span>
      </div>
      
      <div class="book-info-item">
        <label>创建时间：</label>
        <span>{{data.book.create_time}}</span>
      </div>

      <div class="ai-item">
        <span class="nav-link" @click="router.push('/rag_ai_messages?book_id=' + bookId)">打开AI问答页面</span>
      </div>
      
      <button v-if="editing.name || editing.author" class="save-button" @click="saveBook">保存修改</button>
    </div>
    
    <!-- 书籍内容列表 -->
    <div class="content-list-container">
      <div class="content-header">
        <h2>书籍内容</h2>
        <button class="add-button" @click="showAddForm = !showAddForm">+</button>
      </div>
      
      <!-- 新增内容表单 -->
      <div v-if="showAddForm" class="add-content-form">
        <textarea v-model="newContent" placeholder="请输入内容，后端将会使用空行进行分段" rows="10"></textarea>
        <div class="form-buttons">
          <button class="cancel-button" @click="showAddForm = false">取消</button>
          <button class="save-button" @click="addContent">保存</button>
        </div>
      </div>
      
      <div class="content-list">
        <div v-for="(content, index) in contentList" :key="index" class="content-item">
          <p>{{content}}</p>
        </div>
      </div>
    </div>
    
    <!-- 加载动画 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="js">
import router from "../../router";
import {useRoute} from "vue-router";
import {getAddress} from "../../operation/address.ts";
import {ref} from "vue";
import {getLocalData, getTokenData} from "../../operation/dataOperation.ts";
import axios from "axios";

const bookId = useRoute().query.book_id;

const data = ref({ book: {} })
const editing = ref({ name: false, author: false })
const contentList = ref([])
const showAddForm = ref(false)
const newContent = ref('')
const loading = ref(false)

getBookDetail()

async function getBookDetail(){
  loading.value = true;
  try {
    const response = await fetch(`${getAddress()}/book/bookDetail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ book_id: bookId })
    });
    const result = await response.json();
    data.value = result;
    await getBookContent()
  } catch (error) {
    console.error('获取书籍详情失败:', error);
  } finally {
    loading.value = false;
  }
}

async function getBookContent(){
  loading.value = true;
  console.log(data.value.book)
  try {
    const response = await fetch(`${getAddress()}/book/bookContentSearch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        book_id: data.value.book.book_id || 'basic',
        text: '',
        limit: 1000,
        minDistance: 0
      })
    });
    
    const result = await response.json();
    if (result.success && result.data && result.data.data) {
      contentList.value = result.data.data.map(item => item.entity.text);
    }
  } catch (error) {
    console.error('获取书籍内容失败:', error);
  } finally {
    loading.value = false;
  }
}

async function addContent() {
  if (!newContent.value.trim()) {
    alert('请输入内容');
    return;
  }
  
  loading.value = true;
  try {
    const response = await fetch(`${getAddress()}/book/bookContentInsertWithParagraphs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        book_id: data.value.book.book_id,
        text: newContent.value
      })
    });
    
    const result = await response.json();
    if (result.success) {
      showAddForm.value = false;
      newContent.value = '';
      // 重新获取内容列表
      getBookContent();
    } else {
      alert('添加失败，请重试');
    }
  } catch (error) {
    console.error('添加内容失败:', error);
    alert('添加失败，请重试');
  } finally {
    loading.value = false;
  }
}

function startEditing(field) {
  editing.value[field] = true;
  setTimeout(() => {
    const input = document.querySelector(`.edit-input`);
    if (input) input.focus();
  }, 0);
}

async function saveBook() {
  loading.value = true;
  try {
    const response = await fetch(`${getAddress()}/book/bookUpdate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        book_id: data.value.book.book_id,
        usr_id: data.value.book.usr_id,
        book_name: data.value.book.book_name,
        author: data.value.book.author,
        description: data.value.book.description,
        cover_image: data.value.book.cover_image
      })
    });
    
    const result = await response.json();
    if (result.success) {
      alert('保存成功！');
      editing.value = { name: false, author: false };
      // 重新获取数据以更新时间戳
      getBookDetail();
    } else {
      alert('保存失败，请重试');
    }
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败，请重试');
  } finally {
    loading.value = false;
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
  align-items: center;

}

.title-bar {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  width: calc(100vw - 40px);
  height: calc(54px);
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
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

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
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
  margin: 20px 0;
  width: 200px;
  height: 300px;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-detail-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  max-width: 600px;
  margin-top: 60px;
}

.book-info-item {
  display: flex;
  align-items: center;
  margin: 5px 0;
  width: 100%;
  justify-content: center;
}

.ai-item {
  display: flex;
  align-items: center;
  margin: 20px 0 0 0;
  width: 100%;
  justify-content: center;
}

.book-info-item label {
  font-weight: bold;
  margin-right: 10px;
  width: 100px;
  text-align: right;
}

.book-info-item span {
  cursor: pointer;
  padding: 5px;
  border-bottom: 1px dashed #ccc;
}

.book-info-item span:hover {
  background-color: #f0f0f0;
}

.nav-link {
  color: #3b82f6;
  cursor: pointer;
  padding: 5px 12px;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  user-select: none;
}

.nav-link:hover {
  background-color: #e0f0ff;
}

.edit-input {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
  width: 300px;
}

.back-btn {
  height: 24px;
  width: 24px;
  cursor: pointer;
  margin-right: 12px;
  user-select: none;
}

.save-button {
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
.cancel-button {
  padding: 10px 20px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.save-button:hover {
  background-color: #2563eb;
}
.cancel-button:hover {
  background-color: #1e9bec;
}

/* 加载动画 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content-list-container {
  width: 80%;
  max-width: 800px;
  margin-top: 50px;
  margin-bottom: 50px;
}

.content-list-container .content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-list-container h2 {
  text-align: center;
  margin: 0;
  color: #333;
}

.add-button {
  width: 36px;
  height: 36px;
  border-radius: 5px;
  //background-color: #3b82f6;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.add-button:hover {
  background-color: #2563eb;
}

.add-content-form {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.add-content-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
  margin-right: 20px;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 15px;
}

.content-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.content-item {
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex: 1 1 300px;
  max-width: 400px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.content-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.content-item p {
  margin: 0;
  line-height: 1.6;
  color: #555;
}

@media (max-width: 768px) {
  .content-item {
    flex: 1 1 100%;
    max-width: 100%;
  }
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