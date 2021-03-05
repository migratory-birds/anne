/**
 * 我的工作台
 */
import { sendAjax } from '@/api/index';
//下载统计
export function downloadSummary(data,options){
    return sendAjax({
        url:'dashboard/downloadSummary',
        method:'get',
        data,
    },options)
}
//下载记录
export function downloadRecord(data,options){
    return sendAjax({
        url:'dashboard/downloadRecord',
        method:'post',
        data,
    },options)
}