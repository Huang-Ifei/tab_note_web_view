<script setup lang="ts">

import {onMounted} from "vue";

import Prism from "prismjs"; // 引入插件

const content = defineModel()
const props = defineProps(['value'])

onMounted(() => {
  Prism.highlightAllUnder(document.querySelector('.editor-content-view')!);
});

</script>

<template>
  <div v-if="content!=''&&content!=null" style="font-weight: normal" class="editor-content-view" v-html="content">

  </div>
  <div v-if="props.value!=''&&props.value!=null" style="font-weight: normal" class="editor-content-view" v-html="props.value">

  </div>
</template>

<style>
@import "../../operation/prism.css";
.editor-content-view pre {
  margin-bottom: 2px;
}

.editor-content-view {
  border: none;
  border-radius: 0;
  padding: 0 0;
  margin-top: 0;
  overflow-x: auto;
}

.editor-content-view p,
.editor-content-view li {
  white-space: pre-wrap; /* 保留空格 */
}

.editor-content-view blockquote {
  border-left: 8px solid #d0e5f2;
  padding: 10px 10px;
  margin: 10px 0;
  background-color: #f1f1f1;
}

.editor-content-view pre>code {
  display: block;
  padding: 10px;
}

.editor-content-view table {
  border-collapse: collapse;
}
.editor-content-view td,
.editor-content-view th {
  border: 1px solid #bdbdbd;
  padding: 5px;
  min-width: 50px;
  height: 20px;
}
.editor-content-view th {
  padding: 8px;
  background-color: #1c4d98;
  color: #fcfcfc;
}

.editor-content-view ul,
.editor-content-view ol {
  padding-left: 20px;
}

.editor-content-view input[type="checkbox"] {
  margin-right: 5px;
}
</style>