<template>
  <div class="ai-classes-container">
    <div class="title-bar">
      <img class="back-btn" src="../../assets/arrow_back.svg" alt="返回" @click="router.push('/ai_classes')" />
      <h1 class="title-text">
        新增书本</h1>
    </div>

    <div class="book-add-container" style="margin-top: 80px;">
      <h2 class="page-title">新增书本</h2>

      <div class="form-container">
        <div class="form-item">
          <label>封面图片</label>
          <div class="cover-upload" @click="clickInput">
            <img v-if="coverImage" :src="coverImage" alt="封面预览" class="cover-preview"/>
            <div v-else class="cover-placeholder">
              <span style="font-size: 40px; color: #ccc;">+</span>
              <span style="color: #999; font-size: 14px;">点击上传封面</span>
            </div>
          </div>
          <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileChange"/>
        </div>

        <div class="form-item">
          <label>书名 <span style="color: red;">*</span></label>
          <input v-model="form.book_name" type="text" placeholder="请输入书名" class="form-input"/>
        </div>

        <div class="form-item">
          <label>作者 <span style="color: red;">*</span></label>
          <input v-model="form.author" type="text" placeholder="请输入作者" class="form-input"/>
        </div>

        <div class="form-item">
          <label>书本描述 <span style="color: red;">*</span></label>
          <textarea v-model="form.description" placeholder="请输入书本描述" class="form-input form-textarea" rows="4"></textarea>
        </div>

        <div class="form-buttons">
          <button class="cancel-btn" @click="router.push('/ai_classes')">取消</button>
          <button class="submit-btn" @click="submitBook">创建书本</button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {getAddress, getWholeAddress} from '../../operation/address.ts';
import { getLocalData } from '../../operation/dataOperation.ts';
import Compressor from 'compressorjs';
import router from '../../router';

const form = ref({
  book_name: '',
  author: '',
  description: '',
  cover_image: ''
});

const coverImage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);

function clickInput() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file: File | null = (target.files && target.files[0]) || null;
  if (!file) return;

  new Compressor(file, {
    quality: 0.75,
    maxWidth: 1500,
    maxHeight: 1500,
    convertSize: 150000,
    mimeType: 'image/jpeg',
    success(result) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        coverImage.value = base64String;
        const imgName = await insertTabNoteImg(base64String);
        if (imgName) {
          form.value.cover_image = getWholeAddress()+'/tabNoteImg?name='+imgName;
        }
      };
      reader.readAsDataURL(result instanceof Blob ? result : new Blob([result]));
    },
    error(err) {
      console.error('Compression error:', err.message);
      alert('图片压缩失败');
    }
  });
}

async function insertTabNoteImg(s: string): Promise<string> {
  try {
    const response = await fetch(getAddress() + '/insertTabNoteImg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ img: s })
    });
    // const data = await response.json();
    // if (data && data !== 'failed' && data !== '' && data !== 'undefined') {
    //   return data;
    // } else {
    //   alert('图片上传出错');
    //   return '';
    // }
    return await response.text();
  } catch (e) {
    console.error(e);
    alert('图片上传出错');
    return '';
  }
}

async function submitBook() {
  if (!form.value.book_name.trim()) { alert('请输入书名'); return; }
  if (!form.value.author.trim()) { alert('请输入作者'); return; }
  if (!form.value.description.trim()) { alert('请输入书本描述'); return; }
  if (!form.value.cover_image) { alert('请上传封面图片'); return; }

  loading.value = true;
  try {
    const response = await fetch(`${getAddress()}/book/bookAdd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usr_id: getLocalData('id'),
        book_name: form.value.book_name,
        author: form.value.author,
        description: form.value.description,
        cover_image: form.value.cover_image
      })
    });
    const result = await response.json();
    if (result.success) {
      router.push('/ai_classes');
    } else {
      alert('创建失败: ' + (result.message || '未知错误'));
    }
  } catch (error) {
    console.error('创建书本失败:', error);
    alert('创建失败，请重试');
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
  cursor: pointer;
}

.gradient-text {
  background: linear-gradient(90deg, #1e3a8a, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.book-add-container {
  width: 90%;
  max-width: 500px;
  padding-bottom: 50px;
}

.form-container {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 18px;
}

.form-item label {
  display: block;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.cover-upload {
  width: 200px;
  height: 280px;
  border: 2px dashed #ddd;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s;
}

.cover-upload:hover {
  border-color: #3b82f6;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  padding: 10px 24px;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background-color: #4b5563;
}

.submit-btn {
  padding: 10px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.submit-btn:hover {
  background-color: #2563eb;
}

.loading-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>