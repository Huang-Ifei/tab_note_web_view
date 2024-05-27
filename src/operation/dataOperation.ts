import * as Cookies from "js-cookie";
import {getAddress} from "./address.ts"
import {ref} from "vue";

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function loginCheck(): boolean {
    return !(getLocalData('id') == '' || getLocalData('token') == '')
}

export function getLocalData(key: string): string {
    const ss = sessionStorage.getItem(key);
    if (ss == null) {
        const cs = Cookies.default.get(key)
        if (typeof cs === "undefined") {
            return ""
        } else {
            return cs;
        }
    } else {
        return ss.toString();
    }
}

export function setLocalData(key: string, value: string): void {
    const ss = sessionStorage.getItem(key);
    if (ss != null) {
        sessionStorage.setItem(key, value)
    }
    const cs = Cookies.default.get(key)
    if (typeof cs != "undefined") {
        Cookies.default.set(key, value)
    }
}

export function deleteLocalData(key: string) {
    const ss = sessionStorage.getItem(key);
    if (ss != null) {
        sessionStorage.removeItem(key);
    }
    const cs = Cookies.default.get(key)
    if (typeof cs != "undefined") {
        Cookies.default.remove(key);
    }
}

export function getAccountImg(): string {
    let id = getLocalData("id")
    let token = getLocalData("token")
    if (id == '' || token == '') {
        return getAddress() + "/accountImg?id=login"
    }
    return getAddress() + "/accountImg?id=" + id
}

export function getIdImg(id: string): string {
    return getAddress() + "/accountImg?id=" + id;
}

export function escapeHTMLWithOutConsole(str: string): string {
    //替换除了\n以外的字符为html语句
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/ /g, "&nbsp;")
        .replace(/\t/g, "&#9;")
        .replace(/\n/g, "<br>")
}

export function escapeHTML(str: string): string {
    if (str.length == 0) {
        return str
    }
    //替换除了\n以外的字符为html语句
    const htmlString = str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/ /g, "&nbsp;")
        .replace(/\t/g, "&#9;")


    const n: number = htmlString.length
    const i = ref(0)
    //新语句存储器
    const newString = ref("")
    //遍历
    while (i.value < n) {
        //当找到```时，记录代码名称
        if (htmlString[i.value] === '`' && htmlString[i.value + 1] === '`' && htmlString[i.value + 2] === '`') {
            const name = ref("")
            const content = ref("")
            const x = ref(i.value + 3);
            //将回车之前的内容并为代码名称
            while (x.value < n && htmlString[x.value] != '\n') {
                name.value += htmlString[x.value];
                x.value++
            }
            //剩余内容遍历
            while (x.value < n) {
                //若找到结尾更改
                if ((htmlString[x.value] === '`' && htmlString[x.value + 1] === '`' && htmlString[x.value + 2] === '`' && htmlString[x.value + 3] === '\n') || (htmlString[x.value] === '`' && htmlString[x.value + 1] === '`' && htmlString[x.value + 2] === '`' && x.value + 3 == n)) {
                    newString.value += "<div style='background: #1e1f22;color: #ffffff;padding: 10px;border-radius: 8px;font-family: Consolas, Inter ,system-ui, Avenir, Helvetica, Arial, sans-serif;max-width: calc(100% - 20px);min-width: 50%;width: fit-content;font-size: 14px;overflow-wrap: break-word;'>"
                    if (name.value != '') {
                        newString.value += "<div style='background: #3c3f41;color: #ffffff;padding: 4px 10px;margin-bottom: 5px;border-radius: 5px;width: fit-content;display: inline-block;'>" + name.value + "</div>"
                        newString.value += content.value;
                        newString.value += "</div>";
                        i.value = x.value + 3
                    } else {
                        if (content.value.startsWith("\n")) {
                            newString.value += content.value.substring(1, content.value.length);
                        } else {
                            newString.value += content.value
                        }
                        newString.value += "</div>";
                        i.value = x.value + 2
                    }
                    break
                } else {
                    content.value += htmlString[x.value];
                }
                x.value++
            }
        } else if (htmlString[i.value] === '\n' && htmlString[i.value + 1] === '*' && htmlString.substring(i.value + 2, i.value + 8) === '&nbsp;') {
            newString.value += "\n·&nbsp;"
            i.value = i.value + 7
        } else if (htmlString.substring(i.value, i.value + 32) === '\n&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;') {
            newString.value += '\n&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;'
            i.value = i.value + 31
        } else if (htmlString[i.value] + htmlString[i.value + 1] === '**') {
            const name = ref("")
            const x = ref(i.value + 2);
            const isTitle = ref(false)
            while (x.value < n && htmlString[x.value] != '\n') {
                if (htmlString[x.value] + htmlString[x.value + 1] == '**') {
                    newString.value += "<div style='font-weight: bold;display: inline-block;'>" + name.value + "</div>"
                    i.value = x.value + 1;
                    isTitle.value = true
                    break
                }
                name.value += htmlString[x.value];
                x.value++
            }
            if (!isTitle) {
                newString.value += htmlString[i.value];
            }
        } else {
            newString.value += htmlString[i.value]
        }
        i.value++
    }
    //最后变更回车交还
    return newString.value.replace(/\n/g, "<br>")
}