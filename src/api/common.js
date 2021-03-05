import { sendAjax } from '@/api/index';
//部门列表
export function getDeptList(data,options){
    return sendAjax({
        url:'common/dept/list',
        method:'get',
        data,
    },options)
}
//产品名称列表
export function getProcuctList(data,options){
    return sendAjax({
        url:'common/product/list',
        method:'get',
        data,
    },options)
}
//渠道列表
export function getChannelList(data,options){
    return sendAjax({
        url:'common/channel/list',
        method:'get',
        data,
    },options)
}
//协议类型列表
export function getProtocolTypeList(data,options){
    return sendAjax({
        url:'common/protocol/tag/list',
        method:'get',
        data,
    },options)
}
//协议名称
export function getProtocolTagList(data,options){
    return sendAjax({
        url:'common/protocol/template/list',
        method:'get',
        data,
    },options)
}