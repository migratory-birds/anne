import { sendAjax } from '@/api/index';

// 下载、查看日志接口
export function logDownloadList(data) {
  return sendAjax({
    url: '/log/download/list',
    method: 'post',
    data
  })
}

// 操作日志查询
export function logQueryList(data){
  return sendAjax({
    url: '/log/query/list',
    method: 'post',
    data
  })
}
