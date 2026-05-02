import {createRouter, createWebHistory} from 'vue-router'
import ai_assistant from '../components/ai_assistant/ai_assistant.vue'
import add_tab_note from '../components/tab_note/add_tab_note.vue'
import login from '../components/account/login.vue'
import Home from '../components/home.vue'
import signup from '../components/account/signup.vue'
import account from "../components/account/account.vue";
import {ComponentOptionsMixin, DefineComponent, ExtractPropTypes, PublicProps} from "vue";
import {loginCheck} from "../operation/dataOperation.ts";
import Tab_note_view from '../components/tab_note/tab_note_view.vue'
import Tab_manual from '../components/tab_manual.vue'
import Note_ai from '../components/note_ai/note_ai.vue'
import Beat_question from "../components/beat_question/beat_question.vue";
import Adv_fun_auth from "../components/account/adv_fun_auth.vue";
import Fsf_data from "../components/fsf_data.vue";
import Ai_classes from "../components/ai_classes/ai_classes.vue";
import Book_view_edit from "../components/ai_classes/book_view_edit.vue";
import Book_add from "../components/ai_classes/book_add.vue";
import Rag_ai_messages from "../components/ai_classes/rag_ai_messages.vue";
import Class_manage from "../components/class_manage/class_manage.vue";
import Teacher_manage from "../components/class_manage/teacher_manage.vue";
import Student_manage from "../components/class_manage/student_manage.vue";
import Class_member_manage from "../components/class_manage/class_member_manage.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            component: Home,
        },
        {
            path: "/ai_assistant",
            component: aiRouteCheck(),
        },
        {
            path: "/login",
            component: loginRouteCheck(),
        },
        {
            path: "/signup",
            component: signupRouteCheck(),
        },
        {
            path: "/add_tab_note",
            component: add_tab_note,
        },
        {
            path: "/tab_note_view",
            component: Tab_note_view
        },
        {
            path: "/tab_manual",
            component: Tab_manual
        },
        {
            path: "/note_ai",
            component: noteAiRouteCheck()
        }, {
            path: "/beat_question",
            component: bqAiRouteCheck()
        }, {
            path: "/afa",
            component: afaRouteCheck()
        }, {
            path: "/fsf",
            component: Fsf_data
        }, {
            path: "/ai_classes",
            component: Ai_classes
        },{
            path: "/book_edit",
            component : Book_view_edit
        },{
            path: "/book_add",
            component: Book_add
        },{
            path: "/rag_ai_messages",
            component: Rag_ai_messages
        },{
            path: "/class_manage",
            component: Class_manage
        },{
            path: "/teacher_manage",
            component: Teacher_manage
        },{
            path: "/student_manage",
            component: Student_manage
        },{
            path: "/class_member_manage",
            component: Class_member_manage
        }]
})

//暴露路由
export default router

function loginRouteCheck(): DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{}>>, {}, {}> {
    if (loginCheck()) {
        return account
    } else {
        return login
    }
}

function signupRouteCheck(): DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{}>>, {}, {}> {
    if (loginCheck()) {
        return account
    } else {
        return signup
    }
}

function aiRouteCheck(): DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{}>>, {}, {}> {
    if (loginCheck()) {
        return ai_assistant
    } else {
        return login
    }
}

function noteAiRouteCheck(): DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{}>>, {}, {}> {
    if (loginCheck()) {
        return Note_ai
    } else {
        return login
    }
}

function bqAiRouteCheck(): DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{}>>, {}, {}> {
    if (loginCheck()) {
        return Beat_question
    } else {
        return login
    }
}

function afaRouteCheck(): DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{}>>, {}, {}> {
    if (loginCheck()) {
        return Adv_fun_auth
    } else {
        return login
    }
}