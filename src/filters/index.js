
import { logObjList, logContentList, operationModeList } from '@/utils/constant';
// 操作对象
export function filterLogObj(value) {
    const valueStr = value || value === 0 ? `${value}` : ''
    const item = logObjList.filter((item, index) => {
        return item.id === valueStr
    })
    return item.length > 0 && valueStr ? item[0].name : value
}

// 操作内容
export function filterLogContent(value) {
    const valueStr = value || value === 0 ? `${value}` : ''
    const item = logContentList.filter((item, index) => {
        return item.id === valueStr
    })
    return item.length > 0 && valueStr ? item[0].name : value
}

// 操作对象类型
export function filterOperationMode(value) {
    const valueStr = value || value === 0 ? `${value}` : ''
    const item = operationModeList.filter((item, index) => {
        return item.id === valueStr
    })
    return item.length > 0 && valueStr ? item[0].name : value
}