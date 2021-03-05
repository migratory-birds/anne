/**
 * 电子协议管理
 */
import { sendAjax } from '@/api/index';
// 协议查看

export function protocolDetail(data,options){
    return sendAjax({
        url:'protocol/file/detail',
        method:'post',
        data,
    },options)
}

//协议文件下载

export function protocolDownload(data,options){
    return sendAjax({
        url:'protocol/file/download',
        method:'post',
        data,
    },options)
}
export function contractDownload(data,options){
    return sendAjax({
        url:'contract/view',
        method:'post',
        data,
    },options)
}
//检查协议是否存在
export function pFileCheck(data,options){
    return sendAjax({
        url:'protocol/file/check',
        method:'post',
        data,
    },options)
}

//检查存证是否存在
export function cFileCheck(data,options){
    return sendAjax({
        url:'contract/file/check',
        method:'post',
        data,
    },options)
}