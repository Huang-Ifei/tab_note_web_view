
export function getAddress():string{
    //return 'http://101.42.31.139:7845'
    //return 'http://192.168.31.238:7845'
    //return 'http://localhost:7845'
    return '/api'
}

export function getWholeAddress():string{
    return 'https://tabnote.cn/api'
}

export const aiDCAddress = "http://localhost:11713"

export function addressOperation(s:string):string{
    return s.replace(/http:\/\/101\.42\.31\.139:7845/g, "/api")
        .replace(/https:\/\/tabnote\.cn\/api/g, "/api")
}

