<script setup lang="ts">

import Icon_to_home from "./weight/icon_to_home.vue";
import {escapeHTML} from "../operation/dataOperation.ts";

const sourceCode = "```typescript\n" +
    "export function escapeTabNoteToHTML(str: string, pics: string[]): string {\n" +
    "    let count = 0;\n" +
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
    "    let i = 0\n" +
    "    //新语句存储器\n" +
    "    let newString = \"\"\n" +
    "    //遍历\n" +
    "    while (i < n) {\n" +
    "        //当找到```时，记录代码名称\n" +
    "        if (htmlString[i] === '`' && htmlString[i + 1] === '`' && htmlString[i + 2] === '`') {\n" +
    "            let name = \"\"\n" +
    "            let content = \"\"\n" +
    "            let x = i + 3\n" +
    "            //将回车之前的内容并为代码名称\n" +
    "            while (x < n && htmlString[x] != '\\n') {\n" +
    "                name += htmlString[x];\n" +
    "                x++\n" +
    "            }\n" +
    "            //剩余内容遍历\n" +
    "            while (x < n) {\n" +
    "                //若找到结尾更改\n" +
    "                if ((htmlString[x] === '`' && htmlString[x + 1] === '`' && htmlString[x + 2] === '`' && htmlString[x + 3] === '\\n') || (htmlString[x] === '`' && htmlString[x + 1] === '`' && htmlString[x + 2] === '`' && x + 3 == n)) {\n" +
    "                    newString += \"<div style='background: #1e1f22;color: #ffffff;padding: 10px;border-radius: 8px;font-family: Consolas, Inter ,system-ui, Avenir, Helvetica, Arial, sans-serif;max-width: calc(100% - 20px);min-width: 50%;width: fit-content;font-size: 14px;overflow-wrap: break-word;'>\"\n" +
    "                    if (name != '') {\n" +
    "                        newString += \"<div style='background: #3c3f41;color: #ffffff;padding: 4px 10px;margin-bottom: 5px;border-radius: 5px;width: fit-content;display: inline-block;'>\" + name + \"</div>\"\n" +
    "                        newString += content;\n" +
    "                        newString += \"</div>\";\n" +
    "                        i = x + 3\n" +
    "                    } else {\n" +
    "                        if (content.startsWith(\"\\n\")) {\n" +
    "                            newString += content.substring(1, content.length);\n" +
    "                        } else {\n" +
    "                            newString += content\n" +
    "                        }\n" +
    "                        newString += \"</div>\";\n" +
    "                        i = x + 2\n" +
    "                    }\n" +
    "                    break\n" +
    "                } else {\n" +
    "                    content += htmlString[x];\n" +
    "                }\n" +
    "                x++\n" +
    "            }\n" +
    "            if (x > n) {\n" +
    "                newString += \"`\".repeat(3) + name + \"\\n\" + content;\n" +
    "                break\n" +
    "            }\n" +
    "        } else if (htmlString[i] === '\\n' && htmlString[i + 1] === '*' && htmlString.substring(i + 2, i + 8) === '&nbsp;') {\n" +
    "            newString += \"\\n·&nbsp;\"\n" +
    "            i = i + 7\n" +
    "        } else if (htmlString.substring(i, i + 32) === '\\n&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;') {\n" +
    "            newString += '\\n&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;'\n" +
    "            i = i + 31\n" +
    "        } else if (htmlString[i] + htmlString[i + 1] === '**') {\n" +
    "            let name = \"\"\n" +
    "            let x = i + 2\n" +
    "            let isTitle = false\n" +
    "            while (x < n && htmlString[x] != '\\n') {\n" +
    "                if (htmlString[x] + htmlString[x + 1] == '**') {\n" +
    "                    newString += \"<div style='font-weight: bold;display: inline-block;'>\" + name + \"</div>\"\n" +
    "                    i = x + 1;\n" +
    "                    isTitle = true\n" +
    "                    break\n" +
    "                }\n" +
    "                name += htmlString[x];\n" +
    "                x++\n" +
    "            }\n" +
    "            if (x > n) {\n" +
    "                break\n" +
    "            }\n" +
    "            if (!isTitle) {\n" +
    "                newString += htmlString[i];\n" +
    "            }\n" +
    "        } else if (htmlString.substring(i, i + 8) === '{[#pic]}') {\n" +
    "            newString += \"<img alt='\"+count+\"' src='\" + pics[count] + \"' style='max-height: 500px;max-width:80%' />\"\n" +
    "            count++\n" +
    "            i = i + 7\n" +
    "        } else {\n" +
    "            newString += htmlString[i]\n" +
    "        }\n" +
    "        i++\n" +
    "    }\n" +
    "    //最后变更回车交还\n" +
    "    return newString.replace(/\\n/g, \"<br>\")\n" +
    "}" +
    "```"

</script>

<template>
  <icon_to_home/>
  <div id="background">
    <div style="min-height: 54px">

    </div>
    <div style="margin: 0 20px">
      <h2>
        TabNote贴文 特殊字符操作手册
      </h2>
      <div v-html="escapeHTML('**特殊字符列表**')"></div>
      本网站提供以下字符串解析：<br>
      1.```<br>
      2.*<br>
      3.**<br>
      4.{[#pic]}<br><br>
      <div v-html="escapeHTML('**具体规则**')"></div>
      1.当读取到连续的三个 ` 字符（```字符串）时将会读取本行后面的内容作为代码类型的名字，如果在文章的后续内容包含有三个 `
      字符及换行字符（```\n字符串）时，中间的内容将会被识别为代码内容，将以代码形式展现
      <br>例如：<br>
      ```java<br>
      System.out.println('a');
      <br>
      ```<br>
      将会被解析为：
      <div v-html="escapeHTML('```java\nSystem.out.println(\'a\');\n```')"></div>
      2.当读取到"\n*&nbsp;"(回车，星号，空格)的时候将会转译为"\n· "(回车，·，空格)，例如"\n*&nbsp;你好"将被解析为:
      <div v-html="escapeHTML('\n* 你好')"></div>
      <br>
      3.当读取到"\n&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;"(回车，四个空格，星号，空格)时，将会被解析为"\n&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;",建议配合第二条使用，例如"\n*&nbsp;你好\n&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;这是一个测试"将被解析为：
      <div v-html="escapeHTML('\n* 你好\n    * 这是一个测试')"></div>
      <br>
      4.当读取到**且本行内还存在**，那么这段语句将会被加粗，例如"**加粗**"，会被解析为：
      <div v-html="escapeHTML('**加粗**')"></div>
      <br>
      5.当读取到{[#pic]}时将会按照顺序读取图片内容，例如：{[#pic]}这是一张图片{[#pic]}，就分别读取了您上传的第0张和第1张图片
      <br><br>
      附：（本网站TabNote字符串解析HTML源代码）
      <div v-html="escapeHTML(sourceCode)"></div>
    </div>
  </div>
</template>

<style scoped>

#background {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: absolute;
  display: flex;
  flex-direction: column;
}

</style>