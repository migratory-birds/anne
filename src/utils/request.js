import axios from 'axios'
import { Message } from 'element-ui'

// loading实例
let loadingInstance
// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL, // api的base_url
  timeout: 15000, // 请求超时时间
  withCredentials: true
})

// request拦截器
service.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// respone拦截器
service.interceptors.response.use(
  (response) => {
    if (process.env.VUE_APP_MOCK === 'true' && process.env.NODE_ENV !== 'production') {
      return response;
    } else {
      /**
       * code为非20000是抛错 可结合自己业务进行修改
       */
      const res = response.data
      if(res.resCode === '2000') {
        return response.data
      } else if(res.resCode === '1002') {
        console.log(res.resData.redirectUrl)
        window.location.replace(res.resData.redirectUrl)
      } else if(response.status !== 200){
        Message({
          message: res.resMsg,
          type: 'error',
          duration: 8 * 1000
        })
        return Promise.reject('error')
      } else {
        return response.data
      }
    }
  },
  (error) => {
    console.log('err for debug' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
