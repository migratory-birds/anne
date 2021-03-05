/**
 * 数据统计
 */
import { sendAjax } from '@/api/index';

//协议/存证数据统计
export function contractStatis(data,options){
    return sendAjax({
        url:'statis/contract/data',
        method:'post',
        data,
    },options)
}

//存证结果
export function contractResult(data,options){
    return sendAjax({
        url:'satits/contract/result',
        method:'post',
        data,
    },options)
}
export function getRoleList(data,options){
    return sendAjax({
        url:'bg/role/getRoleList',
        method:'get',
        data,
    },options)
}
