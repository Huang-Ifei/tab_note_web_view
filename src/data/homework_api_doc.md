# 作业管理模块 - 接口文档

> 基础路径: `/homeworkManage`
> 所有接口均为 POST，请求体为 JSON 格式
> 每个请求均需携带 `usr_id` 和 `token` 进行身份验证

---

## 通用响应格式

```json
{
  "success": true/false,
  "message": "操作结果描述",
  "data...": "其他业务字段"
}
```

请求异常（参数缺失/格式错误）时返回 HTTP 400，body 为 `"err"`。

---

## 一、教师端

### 1.1 创建作业

**POST** `/homeworkManage/createHomework`

创建作业的同时可批量添加题目，总分自动计算。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | 教师usr_id |
| token | String | 是 | 登录token |
| class_id | String | 是 | 班级ID |
| title | String | 是 | 作业标题 |
| description | String | 否 | 作业描述 |
| deadline | String | 是 | 截止时间，格式 `yyyy-MM-dd HH:mm:ss` |
| questions | String | 是 | 题目列表JSON字符串（见下方格式） |

**questions 格式（JSON字符串）：**

```json
[
  {
    "type": "single_choice",
    "content": "Java中哪个关键字用于继承？",
    "options": "[\"A.interface\",\"B.extends\",\"C.implements\",\"D.import\"]",
    "answer": "B",
    "score": 10
  },
  {
    "type": "multiple_choice",
    "content": "以下哪些是Java基本数据类型？",
    "options": "[\"A.int\",\"B.String\",\"C.boolean\",\"D.double\"]",
    "answer": "A,C,D",
    "score": 10
  },
  {
    "type": "fill_blank",
    "content": "Java中用于定义类的关键字是____",
    "answer": "class",
    "score": 5
  },
  {
    "type": "code",
    "content": "实现一个冒泡排序算法",
    "answer": "public void bubbleSort(int[] arr) { ... }",
    "score": 25,
    "auto_grading": 1,
    "test_cases": "[{\"input\":\"3,1,2\",\"expected\":\"1,2,3\"},{\"input\":\"5,4,3,2,1\",\"expected\":\"1,2,3,4,5\"}]"
  }
]
```

**题目类型说明：**

| type | 说明 | options | answer | auto_grading |
|------|------|---------|--------|-------------|
| single_choice | 单选题 | JSON数组，选项列表 | 正确选项字母，如 `"A"` | 不适用 |
| multiple_choice | 多选题 | JSON数组，选项列表 | 正确选项字母，逗号分隔，如 `"A,C,D"` | 不适用 |
| fill_blank | 填空题 | 不填 | 参考答案文本 | 不适用 |
| code | 代码题 | 不填 | 参考代码 | 0手动/1自动 |

**响应示例：**

```json
{
  "success": true,
  "homework_id": "123456_1715462400000",
  "message": "作业创建成功"
}
```

---

### 1.2 删除作业

**POST** `/homeworkManage/deleteHomework`

同时删除作业及其所有题目。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| homework_id | String | 是 | 作业ID |

**响应示例：**

```json
{ "success": true, "message": "作业删除成功" }
```

---

### 1.3 修改作业

**POST** `/homeworkManage/updateHomework`

仅修改作业基本信息，不影响题目。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| homework_id | String | 是 | |
| title | String | 是 | 新标题 |
| description | String | 是 | 新描述 |
| deadline | String | 是 | 新截止时间 |

**响应示例：**

```json
{ "success": true, "message": "作业更新成功" }
```

---

### 1.4 获取作业详情

**POST** `/homeworkManage/homeworkDetail`

返回作业信息及所有题目。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| homework_id | String | 是 | |

**响应示例：**

```json
{
  "success": true,
  "homework": {
    "homework_id": "xxx",
    "class_id": "cls_001",
    "title": "Java基础练习",
    "description": "第一章综合练习",
    "deadline": "2026-05-20 23:59:59",
    "total_score": 50.0,
    "create_time": "2026-05-11 12:00:00",
    "update_time": "2026-05-11 12:00:00"
  },
  "questions": [
    {
      "question_id": "q1",
      "question_index": 1,
      "type": "single_choice",
      "content": "题目内容",
      "options": "[\"A.xxx\",\"B.yyy\"]",
      "answer": "A",
      "score": 10.0,
      "auto_grading": 0,
      "test_cases": null
    }
  ]
}
```

---

### 1.5 获取班级作业列表

**POST** `/homeworkManage/classHomeworkList`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| class_id | String | 是 | |
| index | Integer | 否 | 分页偏移量，默认0 |

**响应示例：**

```json
{
  "success": true,
  "homework_list": [
    {
      "homework_id": "xxx",
      "class_id": "cls_001",
      "title": "Java基础练习",
      "description": "第一章综合练习",
      "deadline": "2026-05-20 23:59:59",
      "total_score": 50.0,
      "create_time": "2026-05-11 12:00:00"
    }
  ],
  "total": 15
}
```

---

### 1.6 添加题目

**POST** `/homeworkManage/addQuestion`

向已有作业添加一道新题目，总分自动更新。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| homework_id | String | 是 | |
| type | String | 是 | single_choice / multiple_choice / fill_blank / code |
| content | String | 是 | 题目内容 |
| options | String | 否 | 选择题选项JSON数组 |
| answer | String | 否 | 参考答案 |
| score | Double | 否 | 分值，默认0 |
| auto_grading | Integer | 否 | 0手动/1自动，默认0 |
| test_cases | String | 否 | 代码题测试用例JSON |

**响应示例：**

```json
{ "success": true, "question_id": "q_new", "message": "题目添加成功" }
```

---

### 1.7 修改题目

**POST** `/homeworkManage/updateQuestion`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| question_id | String | 是 | |
| question_index | Integer | 是 | 题目序号 |
| type | String | 是 | |
| content | String | 是 | |
| options | String | 否 | |
| answer | String | 否 | |
| score | Double | 否 | |
| auto_grading | Integer | 否 | |
| test_cases | String | 否 | |

**响应示例：**

```json
{ "success": true, "message": "题目更新成功" }
```

---

### 1.8 删除题目

**POST** `/homeworkManage/deleteQuestion`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| question_id | String | 是 | |

**响应示例：**

```json
{ "success": true, "message": "题目删除成功" }
```

---

### 1.9 获取提交列表

**POST** `/homeworkManage/getSubmissions`

获取某个作业的所有学生提交情况。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| homework_id | String | 是 | |

**响应示例：**

```json
{
  "success": true,
  "submissions": [
    {
      "submission_id": "sub_001",
      "student_id": "stu_001",
      "student_name": "张三",
      "submit_time": "2026-05-15 10:30:00",
      "total_score": 42.0,
      "graded": 1,
      "is_late": 0
    },
    {
      "submission_id": "sub_002",
      "student_id": "stu_002",
      "student_name": "李四",
      "submit_time": "2026-05-21 01:00:00",
      "total_score": 0.0,
      "graded": 0,
      "is_late": 1
    }
  ]
}
```

---

### 1.10 查看学生详细作答

**POST** `/homeworkManage/getStudentAnswer`

查看某个提交的每道题作答详情，包含题目内容、参考答案和学生答案。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| submission_id | String | 是 | |

**响应示例：**

```json
{
  "success": true,
  "answers": [
    {
      "answer_id": "ans_001",
      "question_id": "q1",
      "question_index": 1,
      "question_type": "single_choice",
      "question_content": "Java中哪个关键字用于继承？",
      "question_options": "[\"A.interface\",\"B.extends\"]",
      "question_answer": "B",
      "question_score": 10.0,
      "student_answer": "B",
      "score": 10.0,
      "is_correct": 1
    },
    {
      "answer_id": "ans_002",
      "question_id": "q2",
      "question_index": 2,
      "question_type": "code",
      "question_content": "实现冒泡排序",
      "question_options": null,
      "question_answer": "public void sort(int[] a) {...}",
      "question_score": 25.0,
      "student_answer": "public void sort(int[] a) {...}",
      "score": null,
      "is_correct": null
    }
  ]
}
```

> `score` 和 `is_correct` 为 null 表示该题尚未评分。

---

### 1.11 批量评分

**POST** `/homeworkManage/gradeSubmission`

教师对某次提交的题目逐题打分，系统自动汇总总分。可多次评分修改分数。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| submission_id | String | 是 | |
| scores | String | 是 | 评分列表JSON字符串 |

**scores 格式：**

```json
[
  {"question_id": "q1", "score": 10.0},
  {"question_id": "q2", "score": 18.0},
  {"question_id": "q3", "score": 5.0}
]
```

> 只需传入需要评分/修改分数的题目，不需要传所有题目。

**响应示例：**

```json
{
  "success": true,
  "total_score": 33.0,
  "graded": 1,
  "message": "评分成功"
}
```

> `graded` 为1表示所有题目均已评分。

---

## 二、学生端

### 2.1 我的作业列表

**POST** `/homeworkManage/myHomeworkList`

获取某个班级下所有作业，附带本人的提交状态和分数。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| class_id | String | 是 | |
| index | Integer | 否 | 分页偏移量，默认0 |

**响应示例：**

```json
{
  "success": true,
  "homework_list": [
    {
      "homework_id": "hw_001",
      "title": "Java基础练习",
      "description": "第一章综合练习",
      "deadline": "2026-05-20 23:59:59",
      "total_score": 50.0,
      "create_time": "2026-05-11 12:00:00",
      "submitted": 1,
      "submission_id": "sub_001",
      "my_score": 42.0,
      "graded": 1,
      "is_late": 0
    },
    {
      "homework_id": "hw_002",
      "title": "面向对象编程",
      "description": "第二章练习",
      "deadline": "2026-05-25 23:59:59",
      "total_score": 100.0,
      "create_time": "2026-05-12 08:00:00",
      "submitted": 0
    }
  ],
  "total": 10
}
```

---

### 2.2 提交作业

**POST** `/homeworkManage/submitHomework`

学生提交作业答案。每个学生对每个作业只能提交一次。

- 超过截止时间仍可提交，但标记为迟交（`is_late: 1`）
- 选择题/多选题自动评分
- 填空题和代码题需等待教师手动评分

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| homework_id | String | 是 | |
| answers | String | 是 | 答案列表JSON字符串 |

**answers 格式：**

```json
[
  {"question_id": "q1", "student_answer": "B"},
  {"question_id": "q2", "student_answer": "A,C,D"},
  {"question_id": "q3", "student_answer": "class"},
  {"question_id": "q4", "student_answer": "public void sort(int[] arr) {\n  // 冒泡排序实现\n}"}
]
```

**响应示例：**

```json
{
  "success": true,
  "submission_id": "sub_002",
  "is_late": 0,
  "auto_score": 20.0,
  "message": "作业提交成功"
}
```

> `auto_score` 为客观题自动评分的总分，主观题待教师评分后累加。
> 如果已提交过，返回 `{"success":false,"message":"您已提交过该作业"}`。

---

### 2.3 查看我的提交

**POST** `/homeworkManage/mySubmission`

查看自己某次作业的提交详情和成绩。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| usr_id | String | 是 | |
| token | String | 是 | |
| homework_id | String | 是 | |

**响应示例：**

```json
{
  "success": true,
  "submission": {
    "submission_id": "sub_001",
    "submit_time": "2026-05-15 10:30:00",
    "total_score": 42.0,
    "graded": 1,
    "is_late": 0,
    "answers": [
      {
        "question_id": "q1",
        "question_index": 1,
        "question_type": "single_choice",
        "question_content": "Java中哪个关键字用于继承？",
        "question_options": "[\"A.interface\",\"B.extends\"]",
        "student_answer": "B",
        "score": 10.0,
        "is_correct": 1
      },
      {
        "question_id": "q4",
        "question_index": 4,
        "question_type": "code",
        "question_content": "实现冒泡排序",
        "question_options": null,
        "student_answer": "public void sort(int[] a) {...}",
        "score": 17.0,
        "is_correct": null
      }
    ]
  }
}
```

> 未提交时返回 `{"success":false,"message":"未提交该作业"}`。
