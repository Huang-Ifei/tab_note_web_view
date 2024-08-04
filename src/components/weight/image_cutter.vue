<script setup lang="ts">
import {ref} from 'vue';
import Compressor from 'compressorjs';
import axios from "axios";
import {getAddress} from "../../operation/address.ts";
import {getLocalData, getTokenData} from "../../operation/dataOperation.ts";

let props = defineProps(['setContentValue'])

const imageUrl = ref()

async function setAccountImg() {
  props.setContentValue("服务器正在处理中")
  const tk =  await getTokenData();
  const setAccountImgPost = await axios.post(getAddress() + "/account_img_set", {
    id: getLocalData('id'),
    token: tk,
    base64Img: imageUrl.value
  })
  if (setAccountImgPost.status == 200) {
    if(setAccountImgPost.data.response=='success'){
      props.setContentValue("上传成功，即将跳转")
      location.href="/login"
    }else if(setAccountImgPost.data.response=='id_token_check_in_failed'){
      props.setContentValue("登录已失效，请退出账户重新登录")
    }else if(setAccountImgPost.data.response=='failed'){
      props.setContentValue("服务器操作失败，请重新上传")
    }else{
      props.setContentValue(setAccountImgPost.data.response)
    }
  }else {
    props.setContentValue("网络请求失败")
  }
}

function handleFileChange(event: Event) {
  //事件的目标作为HTML输入组件
  const target = event.target as HTMLInputElement;
  //输入组件的第0个文件
  const file: File | null = (target.files && target.files[0]) || null;

  if (file) {
    try {
      //压缩文件
      new Compressor(file, {
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
        convertSize: 150000,//150KB
        mimeType: 'image/jpeg',
        success(result) {//成功执行：reader读取内容到imageUrl中（base64编码）
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result as string;
            imageUrl.value = base64String;
            console.log(base64String);
          };
          reader.readAsDataURL(result instanceof Blob ? result : new Blob([result]));
        },
        error(error) {
          console.error('Compression error:', error.message);
        },
      });
    } catch (e) {
      console.error(e)
    }
  } else {
    // 如果没有选择文件，重置图片 URL
    imageUrl.value = null;
  }
}
</script>

<template>
  <div>
    <input type="file" @change="handleFileChange($event)" accept="image/*" style="max-width: 90%"><br>
    <img v-if="imageUrl" :src="imageUrl" alt="Image" style="max-width: 150px; max-height: 150px;">
    <button v-if="imageUrl" @click="setAccountImg">提交</button>
  </div>
</template>

<style scoped>
img {
  margin-left: 10px;
}
button {
  color: #1a1a1a;
  background: white;
  margin-left: 10px;
  position: relative;
  top: -15px;
}
</style>
