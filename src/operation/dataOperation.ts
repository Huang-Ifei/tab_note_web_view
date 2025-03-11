import * as Cookies from "js-cookie";
import {getAddress} from "./address.ts"
import {privateKey, publicKey} from "./cryptic.ts";
import {JSEncrypt} from "jsencrypt";
import axios from "axios";
import router from "../router";
import katex from 'katex';

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function loginCheck(): boolean {
    return !(getLocalData('id') == '')
}

export function getLocalData(key: string): string {
    const ss = sessionStorage.getItem(key);
    if (ss == null) {
        const cs = Cookies.default.get(key)
        if (typeof cs === "undefined") {
            return ""
        } else {
            sessionStorage.setItem(key, cs)
            return cs;
        }
    } else {
        return ss.toString();
    }
}

export async function getTokenData(): Promise<string> {

    //判断是否有未加密的token被存储，如果有，则使其加密存储进加密token里面，并销毁未加密的token
    const css = Cookies.default.get('token');
    if (typeof css !== 'undefined') {
        const crypt = new JSEncrypt();
        crypt.setPublicKey(publicKey)
        const encryptToken = crypt.encrypt(css).toString()
        localStorage.setItem('encryptionToken', encryptToken);
        Cookies.default.remove('token')
    }
    //判断是否有存储在Cookie当中的加密token,如果有就变更为localStorage
    const csss = Cookies.default.get('encryptionToken');
    if (typeof csss !== 'undefined') {
        localStorage.setItem('encryptionToken', csss);
        Cookies.default.remove('encryptionToken')
    }
    const ss = sessionStorage.getItem('encryptionToken');
    if (ss == null) {
        const cs = localStorage.getItem('encryptionToken')
        if (cs == null) {
            return ""
        } else {
            sessionStorage.setItem('encryptionToken', cs)
            return getDecryptAndEncryptToken(cs);
        }
    } else {
        return getDecryptAndEncryptToken(ss.toString());
    }
}

async function getDecryptAndEncryptToken(s: string): Promise<string> {
    //使用私钥将被token的内容解密
    const crypt = new JSEncrypt();
    crypt.setPrivateKey(privateKey)
    const decryptToken = crypt.decrypt(s)
    if (decryptToken === false) {
        return "";
    } else {
        const tokenCrypt = new JSEncrypt();
        const axiosResponse = await axios.get(getAddress() + "/public_key")
        tokenCrypt.setPublicKey(axiosResponse.data.toString())
        return tokenCrypt.encrypt(decryptToken).toString()
    }
}

export function getLocalNumber(key: string): number {
    const ss = sessionStorage.getItem(key);
    if (ss == null) {
        const cs = Cookies.default.get(key)
        if (typeof cs === "undefined") {
            return 1
        } else {
            sessionStorage.setItem(key, cs)
            return Number(cs);
        }
    } else {
        return Number(ss);
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
    if (id == '') {
        return getAddress() + "/accountImg?id=login"
    }
    return getAddress() + "/accountImg?id=" + id
}

export function getIdImg(id: string): string {
    return getAddress() + "/accountImg?id=" + id;
}

export function escapeHTMLWithOutConsole(str: string): string {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/ /g, "&nbsp;")
        .replace(/\t/g, "&#9;")
        .replace(/\n/g, "<br>")
}

export function htmlToString(str: string): string {
    return str.replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&#9;/g, "\t")
        .replace(/<br>/g, "\n")
}

export function isApp(): boolean {
    const ia = Cookies.default.get('isApp')
    if (ia == 'true') {
        return true
    } else {
        return false
    }
}

export function escapeHTML(st: string): string {
    if (st.length == 0) {
        return st
    }
    let str = ""
    if (st.startsWith("\n\n")){
        str = st.replace(/^\n\n/, '');
    }else{
        str = st
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
    let i = 0
    //新语句存储器
    let newString = ""
    //遍历
    while (i < n) {
        //当找到```时，记录代码名称
        if (htmlString[i] === '`' && htmlString[i + 1] === '`' && htmlString[i + 2] === '`') {
            let name = ""
            let content = ""
            let x = i + 3
            //将回车之前的内容并为代码名称
            while (x < n && htmlString[x] != '\n') {
                name += htmlString[x];
                x++
            }
            //剩余内容遍历
            while (x < n) {
                //若找到结尾更改
                if ((htmlString[x] === '`' && htmlString[x + 1] === '`' && htmlString[x + 2] === '`' && htmlString[x + 3] === '\n') || (htmlString[x] === '`' && htmlString[x + 1] === '`' && htmlString[x + 2] === '`' && x + 3 == n)) {
                    newString += "<div style='background: #1e1f22;color: #ffffff;padding: 10px;border-radius: 8px;font-family: Consolas, Inter ,system-ui, Avenir, Helvetica, Arial, sans-serif;max-width: calc(100% - 20px);min-width: 50%;width: fit-content;font-size: 14px;overflow-wrap: break-word;'>"
                    if (name != '') {
                        newString += "<div style='background: #3c3f41;color: #ffffff;padding: 4px 10px;margin-bottom: 5px;border-radius: 5px;width: fit-content;display: inline-block;'>" + name + "</div>"
                        newString += content;
                        newString += "</div>";
                        i = x + 3
                    } else {
                        if (content.startsWith("\n")) {
                            newString += content.substring(1, content.length);
                        } else {
                            newString += content
                        }
                        newString += "</div>";
                        i = x + 2
                    }
                    break
                } else {
                    content += htmlString[x];
                }
                x++
            }
            if (x > n) {
                newString += "`".repeat(3) + name + "\n" + content;
                break
            }
        } else if ((i === 0 || htmlString[i - 1] === '\n') && (htmlString[i] === '#' && htmlString[i + 1] === '#' && htmlString[i + 2] === '#' && htmlString[i + 3] === '#')) {
            let title = ""
            let x = i + 4
            //将回车之前的内容并为代码名称
            while (x < n && htmlString[x] != '\n') {
                title += htmlString[x];
                x++
            }
            i = x
            newString += `<h4 style="color: #213547;padding: 0;margin: 0">${title}</h4>`
        }  else if ((i === 0 || htmlString[i - 1] === '\n') && (htmlString[i] === '#' && htmlString[i + 1] === '#' && htmlString[i + 2] === '#')) {
            let title = ""
            let x = i + 3
            //将回车之前的内容并为代码名称
            while (x < n && htmlString[x] != '\n') {
                title += htmlString[x];
                x++
            }
            i = x
            newString += `<h3 style="color: #213547;padding: 0;margin: 0">${title}</h3>`
        }  else if ((i === 0 || htmlString[i - 1] === '\n') && (htmlString[i] === '#' && htmlString[i + 1] === '#')) {
            let title = ""
            let x = i + 2
            //将回车之前的内容并为代码名称
            while (x < n && htmlString[x] != '\n') {
                title += htmlString[x];
                x++
            }
            i = x
            newString += `<h2 style="color: #213547;padding: 0;margin: 0">${title}</h2>`
        }   else if (htmlString[i] === '\n' && htmlString[i + 1] === '*' && htmlString.substring(i + 2, i + 8) === '&nbsp;') {
            newString += "\n·&nbsp;"
            i = i + 7
        } else if (htmlString.substring(i, i + 32) === '\n&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;') {
            newString += '\n&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;'
            i = i + 31
        } else if (htmlString[i] + htmlString[i + 1] === '**') {
            let name = ""
            let x = i + 2
            let isTitle = false
            while (x < n && htmlString[x] != '\n') {
                if (htmlString[x] + htmlString[x + 1] == '**') {
                    newString += "<p style='font-weight: bold;display: inline-block;overflow-wrap: break-word;text-overflow: ellipsis;max-width: 100%'>" + name + "</p>"
                    i = x + 1;
                    isTitle = true
                    break
                } else if (htmlString[x] + htmlString[x + 1] == '\\(') {
                    let content = ``
                    let y = x + 2
                    while (y < n && htmlString[y] != '\n' && htmlString[y] + htmlString[y + 1] != '\\)') {
                        content += htmlString[y];
                        y++
                    }
                    content = content.replace(/&amp;/g, "&")
                        .replace(/&lt;/g, "<")
                        .replace(/&gt;/g, ">")
                        .replace(/&quot;/g, "\"")
                        .replace(/&#039;/g, "'")
                        .replace(/&nbsp;/g, " ")
                        .replace(/&#9;/g, "\t")
                    try {
                        let renderString = katex.renderToString(content, {
                            displayMode: false,
                            output: 'mathml',
                        })
                        renderString = renderString.replace(content.replace(/&/g, "&amp;"), '')
                        name += renderString
                        console.log(renderString)
                    } catch (e) {
                        console.error(e)
                    }
                    x = y + 2
                    isTitle = true
                } else {
                    name += htmlString[x];
                    x++
                }
            }
            if (x > n) {
                break
            }
            if (!isTitle) {
                newString += htmlString[i];
            }
        } else if (htmlString[i] + htmlString[i + 1] === `\\[`) {
            let x = i + 2
            let content = ``
            while (x < n && htmlString[x] + htmlString[x + 1] != '\\]') {
                content += htmlString[x];
                x++
            }
            content = content.replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, "\"")
                .replace(/&#039;/g, "'")
                .replace(/&nbsp;/g, " ")
                .replace(/&#9;/g, "\t")
            try {
                let renderString = katex.renderToString(content, {
                    displayMode: true,
                    output: 'mathml',
                })
                console.log(`\\[` + content + `\\]`)
                renderString = renderString.replace(content.replace(/&/g, "&amp;"), '')
                newString += renderString
                console.log(renderString)
            } catch (e) {
                console.error(e)
            }

            if (x + 2 > n) {
                break
            } else {
                i = x + 1
            }
        } else if (htmlString[i] + htmlString[i + 1] === `\\(`) {
            let x = i + 2
            let content = ``
            while (x < n && htmlString[x] + htmlString[x + 1] != '\\)') {
                content += htmlString[x];
                x++
            }
            console.log(`\\(` + content + `\\)`)
            content = content.replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, "\"")
                .replace(/&#039;/g, "'")
                .replace(/&nbsp;/g, " ")
                .replace(/&#9;/g, "\t")

            try {
                let renderString = katex.renderToString(content, {
                    displayMode: false,
                    output: 'mathml',
                })
                renderString = renderString.replace(content.replace(/&/g, "&amp;"), '')
                newString += renderString
                console.log(renderString)
            } catch (e) {
                console.error(e)
            }

            if (x + 2 > n) {
                break
            } else {
                i = x + 1
            }
        } else {
            newString += htmlString[i]
        }
        i++
    }
    //最后变更回车交还
    return newString.replace(/\n/g, "<br>")
}

export function escapeTabNoteToHTML(str: string, pics: string[]): string {
    let count = 0;
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
    let i = 0
    //新语句存储器
    let newString = ""
    //遍历
    while (i < n) {
        //当找到```时，记录代码名称
        if (htmlString[i] === '`' && htmlString[i + 1] === '`' && htmlString[i + 2] === '`') {
            let name = ""
            let content = ""
            let x = i + 3
            //将回车之前的内容并为代码名称
            while (x < n && htmlString[x] != '\n') {
                name += htmlString[x];
                x++
            }
            //剩余内容遍历
            while (x < n) {
                //若找到结尾更改
                if ((htmlString[x] === '`' && htmlString[x + 1] === '`' && htmlString[x + 2] === '`' && htmlString[x + 3] === '\n') || (htmlString[x] === '`' && htmlString[x + 1] === '`' && htmlString[x + 2] === '`' && x + 3 == n)) {
                    newString += "<div style='background: #1e1f22;color: #ffffff;padding: 10px;border-radius: 8px;font-family: Consolas, Inter ,system-ui, Avenir, Helvetica, Arial, sans-serif;max-width: calc(100% - 20px);min-width: 50%;width: fit-content;font-size: 14px;overflow-wrap: break-word;'>"
                    if (name != '') {
                        newString += "<div style='background: #3c3f41;color: #ffffff;padding: 4px 10px;margin-bottom: 5px;border-radius: 5px;width: fit-content;display: inline-block;'>" + name + "</div>"
                        newString += content;
                        newString += "</div>";
                        i = x + 3
                    } else {
                        if (content.startsWith("\n")) {
                            newString += content.substring(1, content.length);
                        } else {
                            newString += content
                        }
                        newString += "</div>";
                        i = x + 2
                    }
                    break
                } else {
                    content += htmlString[x];
                }
                x++
            }
            if (x > n) {
                newString += "`".repeat(3) + name + "\n" + content;
                break
            }
        } else if (htmlString[i] === '\n' && htmlString[i + 1] === '*' && htmlString.substring(i + 2, i + 8) === '&nbsp;') {
            newString += "\n·&nbsp;"
            i = i + 7
        } else if (i === 0 && htmlString[i] === '*' && htmlString.substring(i + 1, i + 7) === '&nbsp;') {
            newString += "\n·&nbsp;"
            i = i + 7
        } else if (htmlString.substring(i, i + 32) === '\n&nbsp;&nbsp;&nbsp;&nbsp;*&nbsp;') {
            newString += '\n&nbsp;&nbsp;&nbsp;&nbsp;·&nbsp;'
            i = i + 31
        } else if (htmlString[i] + htmlString[i + 1] === '**') {
            let name = ""
            let x = i + 2
            let isTitle = false
            while (x < n && htmlString[x] != '\n') {
                if (htmlString[x] + htmlString[x + 1] == '**') {
                    newString += "<div style='font-weight: bold;display: inline-block;max-width: 100%'>" + name + "</div>"
                    i = x + 1;
                    isTitle = true
                    break
                }
                name += htmlString[x];
                x++
            }
            if (x > n) {
                break
            }
            if (!isTitle) {
                newString += htmlString[i];
            }
        } else if (htmlString.substring(i, i + 8) === '{[#pic]}') {
            newString += "<img alt='" + count + "' src='" + pics[count] + "' style='max-height: 500px;max-width:80%' />"
            count++
            i = i + 7
        } else {
            newString += htmlString[i]
        }
        i++
    }
    //最后变更回车交还
    return newString.replace(/\n/g, "<br>")
}

export async function deleteAccount() {

    const tk = await getTokenData()

    const deleteRequest = await axios.post(getAddress() + "/account", {
        mesType: -1,
        token: tk,
    })

    deleteLocalData('id')
    deleteLocalData('name')
    deleteLocalData('token')
    console.log(deleteRequest.data.response)

    await router.push("/")
    window.location.reload()
}