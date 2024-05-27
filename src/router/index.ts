import { createRouter, createWebHistory } from 'vue-router'
import ai_assistant from '../components/ai_assistant.vue'
import add_tab_note from '../components/add_tab_note.vue'
import login from '../components/login.vue'
import Home from '../components/home.vue'
import signup from '../components/signup.vue'
import account from "../components/account.vue";
import {ComponentOptionsMixin, DefineComponent, ExtractPropTypes, PublicProps} from "vue";
import {loginCheck} from "../operation/dataOperation.ts";
import Tab_note_view from '../components/tab_note_view.vue'
import Tab_note_content_manual from '../components/tab_note_content_manual.vue'

const router = createRouter({
    history: createWebHistory(),
    routes:[
        {
            path:"/",
            component: Home,
        },
        {
            path:"/ai_assistant",
            component: aiRouteCheck(),
        },
        {
            path:"/login",
            component: loginRouteCheck(),
        },
        {
            path:"/signup",
            component: signupRouteCheck(),
        },
        {
            path:"/add_tab_note",
            component: add_tab_note,
        },
        {
            path:"/tab_note_view",
            component: Tab_note_view
        },
        {
            path:"/manual",
            component: Tab_note_content_manual
        },
    ]
})

//暴露路由
export default router

function loginRouteCheck(): DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{}>>, {}, {}> {
    if (loginCheck()){
        return account
    }else{
        return login
    }
}
function signupRouteCheck(): DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{}>>, {}, {}> {
    if (loginCheck()){
        return account
    }else{
        return signup
    }
}

function aiRouteCheck(): DefineComponent<{}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<{}>>, {}, {}> {
    if (loginCheck()){
        return ai_assistant
    }else{
        return login
    }
}
