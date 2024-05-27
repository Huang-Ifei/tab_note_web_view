<script setup lang="ts">

import Icon_to_home from "./weight/icon_to_home.vue";
import {escapeHTML} from "../operation/dataOperation.ts";

const sourceCode = "```typescript\n" +
    "export function escapeHTML(str: string): string {\n" +
    "    if (str.length == 0) {\n" +
    "        return str\n" +
    "    }\n" +
    "    //替换除了\\n以外的字符为html语句\n" +
    "    const htmlString = str\n" +
    "        .replace(/&/g, \"&amp;\")\n" +
    "        .replace(/</g, \"&lt;\")\n" +
    "        .replace(/>/g, \"&gt;\")\n" +
    "        .replace(/\"/g, \"&quot;\")\n" +
    "        .replace(/'/g, \"&#039;\")\n" +
    "        .replace(/ /g, \"&nbsp;\")\n" +
    "        .replace(/\\t/g, \"&#9;\")\n" +
    "\n" +
    "\n" +
    "    const n: number = htmlString.length\n" +
    "    const i = ref(0)\n" +
    "    //新语句存储器\n" +
    "    const newString = ref(\"\")\n" +
    "    //遍历\n" +
    "    while (i.value < n) {\n" +
    "        //当找到```时，记录代码名称\n" +
    "        if (htmlString[i.value] === '`' && htmlString[i.value + 1] === '`' && htmlString[i.value + 2] === '`') {\n" +
    "            const name = ref(\"\")\n" +
    "            const content = ref(\"\")\n" +
    "            const x = ref(i.value + 3);\n" +
    "            //将回车之前的内容并为代码名称\n" +
    "            while (x.value < n && htmlString[x.value] != '\\n') {\n" +
    "                name.value += htmlString[x.value];\n" +
    "                x.value++\n" +
    "            }\n" +
    "            //剩余内容遍历\n" +
    "            while (x.value < n) {\n" +
    "                //若找到结尾更改\n" +
    "                if ((htmlString[x.value] === '`' && htmlString[x.value + 1] === '`' && htmlString[x.value + 2] === '`' && htmlString[x.value + 3] === '\\n') || (htmlString[x.value] === '`' && htmlString[x.value + 1] === '`' && htmlString[x.value + 2] === '`' && x.value + 3 == n)) {\n" +
    "                    newString.value += \"<div style='background: #1e1f22;color: #ffffff;padding: 10px;border-radius: 8px;font-family: Consolas, Inter ,system-ui, Avenir, Helvetica, Arial, sans-serif;max-width: calc(100% - 20px);min-width: 50%;width: fit-content;font-size: 14px;overflow-wrap: break-word;'>\"\n" +
    "                    if (name.value != '') {\n" +
    "                        newString.value += \"<div style='background: #3c3f41;color: #ffffff;padding: 4px 10px;margin-bottom: 5px;border-radius: 5px;width: fit-content;display: inline-block;'>\" + name.value + \"</div>\"\n" +
    "                        newString.value += content.value;\n" +
    "                        newString.value += \"</div>\";\n" +
    "                        i.value = x.value + 3\n" +
    "                    } else {\n" +
    "                        if (content.value.startsWith(\"\\n\")) {\n" +
    "                            newString.value += content.value.substring(1, content.value.length);\n" +
    "                        } else {\n" +
    "                            newString.value += content.value\n" +
    "                        }\n" +
    "                        newString.value += \"</div>\";\n" +
    "                        i.value = x.value + 2\n" +
    "                    }\n" +
    "                    break\n" +
    "                } else {\n" +
    "                    content.value += htmlString[x.value];\n" +
    "                }\n" +
    "                x.value++\n" +
    "            }\n" +
    "        } else if (htmlString[i.value] === '\\n' && htmlString[i.value + 1] === '*' && htmlString.substring(i.value + 2, i.value + 8) === '&nbsp;') {\n" +
    "            newString.value += \"\\n·&nbsp;\"\n" +
    "            i.value = i.value + 7\n" +
    "        } else if (htmlString.substring(i.value, i.value + 32) === '\\n&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;') {\n" +
    "            newString.value += '\\n&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;'\n" +
    "            i.value = i.value + 31\n" +
    "        } else if (htmlString[i.value] + htmlString[i.value + 1] === '**') {\n" +
    "            const name = ref(\"\")\n" +
    "            const x = ref(i.value + 2);\n" +
    "            const isTitle = ref(false)\n" +
    "            while (x.value < n && htmlString[x.value] != '\\n') {\n" +
    "                if (htmlString[x.value] + htmlString[x.value + 1] == '**') {\n" +
    "                    newString.value += \"<div style='font-weight: bold;display: inline-block;'>\" + name.value + \"</div>\"\n" +
    "                    i.value = x.value + 1;\n" +
    "                    isTitle.value = true\n" +
    "                    break\n" +
    "                }\n" +
    "                name.value += htmlString[x.value];\n" +
    "                x.value++\n" +
    "            }\n" +
    "            if (!isTitle) {\n" +
    "                newString.value += htmlString[i.value];\n" +
    "            }\n" +
    "        } else {\n" +
    "            newString.value += htmlString[i.value]\n" +
    "        }\n" +
    "        i.value++\n" +
    "    }\n" +
    "    //最后变更回车交还\n" +
    "    return newString.value.replace(/\\n/g, \"<br>\")\n" +
    "}\n" +
    "```"

</script>

<template>
  <div id="background">
    <icon_to_home/>
    <div style="margin: 0 20px">
      <h2>
        TabNote贴文 特殊字符操作手册
      </h2>
      <div v-html="escapeHTML('**特殊字符列表**')"></div>
      本网站提供以下字符串解析：<br>
      1.```<br>
      2.*<br>
      3.**<br><br>
      <div v-html="escapeHTML('**具体规则**')"></div>
      1.当读取到连续的三个 ` 字符（```字符串）时将会读取本行后面的内容作为代码类型的名字，如果在文章的后续内容包含有三个 ` 字符及换行字符（```\n字符串）时，中间的内容将会被识别为代码内容，将以代码形式展现
      <br>例如：<br>
      ```java<br>
      System.out.println('a');
      <br>
      ```<br>
      将会被解析为：
      <div v-html="escapeHTML('```java\nSystem.out.println(\'a\')\n```')"></div>
      2.当读取到"\n*&nbsp;"(回车，星号，空格)的时候将会转译为"\n· "(回车，·，空格)，例如"\n*&nbsp;你好"将被解析为:
      <div v-html="escapeHTML('\n* 你好')"></div><br>
      3.当读取到"\n&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;"(回车，四个空格，星号，空格)时，将会被解析为"\n&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;",建议配合第二条使用，例如"\n*&nbsp;你好\n&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;这是一个测试"将被解析为：
      <div v-html="escapeHTML('\n* 你好\n    · 这是一个测试')"></div><br>
      4.当读取到**且本行内还存在**，那么这段语句将会被加粗，例如"**加粗**"，会被解析为：
      <div v-html="escapeHTML('**加粗**')"></div><br>
      <br><br>
      附：（本网站内容字符串解析源代码）
      <div v-html="escapeHTML(sourceCode)"></div>
    </div>
  </div>
</template>

<style scoped>
#background {
  width: 100%;
  overflow: auto;
  position: absolute;
  display: flex;
  flex-direction: column;
}
</style>