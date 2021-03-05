import axios from "axios";
import { Message } from "element-ui";
export function downLoadFile(url,params = {},method){
    axios({
      method:method ||"get",
      url:url,
      // params:params,
      data:params,
      responseType:'blob',
    }).then(res => {
      console.log('resfff',res)
      let blob = res.data;
      let fileName = decodeURIComponent(
        res.headers['content-disposition'].split('filename=')[1]
      );
      exportFile(blob,fileName);
    }).catch(res => {
      Message({
        message:'下载失败，请重试。',
        type:"error",
        duration:5*1000
      });
    })
  }
  function exportFile(blob,fileName) {
    let reader = new FileReader();
    reader.readAsDataURL(blob)
    reader.onload = (e) => {
        let a = document.createElement('a');
        a.download = fileName;
        a.href = e.target.result;
        document.body.appendChild(a)
        a.click();
        Message({
            message:'下载成功',
            type:"success",
            duration:5*1000
          });
    }
  }
  export function deepCopy(obj) {
    // 只拷贝对象
    if (typeof obj !== 'object') return
    // 根据obj的类型判断是新建一个数组还是一个对象
    var newObj = obj instanceof Array ? [] : {}
    for (var key in obj) {
      // 遍历obj,并且判断是obj的属性才拷贝
      if (obj.hasOwnProperty(key)) {
        // 判断属性值的类型，如果是对象递归调用深拷贝
        newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key]
      }
    }
    return newObj
  }
//时间戳转日期
export function formatDate(timestamp,type){
  let date = new Date(timestamp);
  let YY = date.getFullYear()+'-';
  let MM = (date.getMonth() +1 < 10? '0' + (date.getMonth()+1) : date.getMonth() + 1) +'-';
  let DD = (date.getDate() < 10 ? '0'+date.getDate(): date.getDate());
  let hh = (date.getHours() < 10? '0'+date.getHours():date.getHours()) +':';
  let mm = (date.getMinutes() < 10?'0'+date.getMinutes():date.getMinutes()) + ':';
  let ss = (date.getSeconds()< 10 ? '0'+date.getSeconds():date.getSeconds());
  switch(type){
    case 'YY-MM-DD':
      return YY+MM+DD;
    default:
      return YY+MM+DD+ ' '+ hh+mm+ss;
  }
}

// 获取指定日期零点的时间
export function getZeroTime(timestamp) {
  let now_date;
  if (timestamp) {
    now_date = new Date(timestamp);//获取Date对象
  } else {
    now_date = new Date();//获取Date对象
  }
  now_date.setHours(0);//设置小时
  now_date.setMinutes(0);//设置分钟
  now_date.setSeconds(0);//设置秒
  now_date.setMilliseconds(0);//设置毫妙
  return now_date.getTime();//获取毫秒时间戳
}
// 获取指定日期23:59:59的时间
export function getEndTime(timestamp) {
  let now_date;
  if (timestamp) {
    now_date = new Date(timestamp);//获取Date对象
  } else {
    now_date = new Date();//获取Date对象
  }
  now_date.setHours(23);//设置小时
  now_date.setMinutes(59);//设置分钟
  now_date.setSeconds(59);//设置秒
  now_date.setMilliseconds(0);//设置毫妙
  return now_date.getTime();//获取毫秒时间戳
}

export function getSpanDays(startTime, endTime) {
  if (startTime && endTime) {
    const sTime = getZeroTime(startTime)
    const eTime = getEndTime(endTime)
    const spanDays = parseInt((eTime - sTime)/(24*60*60*1000))
    return spanDays
  }
  return ''
}