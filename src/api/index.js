import request from '@/utils/request';
import { Loading,Message } from 'element-ui'
export async function sendAjax(data, options = {}) {
    let loadingInstance
    const asyncOptions = Object.assign({}, {
        loadingFlag: true,
      },
        options,
      );
      // console.log(options, asyncOptions);
      if (asyncOptions.loadingFlag) {
        // 显示loading
        loadingInstance = Loading.service({
          lock: true,
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
    }
    const optionsHeader = options.header || {};
    const response = await request({
        url: data.url,
        method: data.method,
        headers: {
            'Accept':'application/json',
            'X-Requested-With':'XMLHttpRequest',
            'Content-Type': 'application/json',
            ...optionsHeader,
        },
        data: data.data,
    }).then(res => res)
    .catch(err => {
        console.log('err',err)
        if (asyncOptions.loadingFlag) {
            loadingInstance.close();
        }
        if(err.response){
            console.log('err',err.response)
        } else {
            throw new Error('网络不见了')
        }
    })
    if(response.resCode !== '2000'){
        Message({
            message: response.resMsg,
            type: 'error',
            duration: 5 * 1000
        })
    }
    if (asyncOptions.loadingFlag) {
        loadingInstance.close();
    }
    return response;
}
