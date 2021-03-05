/**
 * 快速搜索
 */
import { sendAjax } from '@/api/index';
//下载统计
export function quickIndexList(data,options){
    return sendAjax({
        url:'quickIndex/list',
        method:'post',
        data,
    },options)
}
//协议列表
export function protocolList(data,options){
    return sendAjax({
        url:'protocol/list',
        method:'post',
        data,
    },options)
}
//存证列表
export function contractList(data,options){
    return sendAjax({
        url:'contract/list',
        method:'post',
        data,
    },options)
}