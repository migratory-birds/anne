import { Message } from "element-ui";
import axios from "axios";

export default {
    name:'batchDownLoadfile',
    methods:{
        batchDownLoadFile(url,params = {},method){
            axios({
              method:method ||"get",
              url:url,
              data:params,
            responseType:'blob',
            }).then(res => {
                this.succount = res.headers['succount']
                this.failcount = res.headers['failcount']
                if(res.status == 200){
                    this.handelSuccess(res)
                } else {
                    console.log('失败')
                    this.succount = res.headers['succount']
                    if(this.succount ==0){//全部失败
                        console.log('全部失败')
                        Message({
                            message:'下载失败，请重试。',
                            type:"error",
                            duration:5*1000
                          });
                    }
                }
            }).catch(resp => {
                console.log('resp',resp)
                Message({
                  message:'下载失败，请重试。',
                  type:"error",
                  duration:5*1000
                });
            })
        },
        handelSuccess(res){
            this.$refs.PurposeDialog.setDowned();
            this.$refs.PurposeDialog.hide();
            // let blob = new Blob([res.data],{type: "application/octet-stream"})
            let fileName = decodeURIComponent(
              res.headers['content-disposition'].split('filename=')[1]
            );
            let blob = new Blob([res.data],{type: "application/zip"})
            this.exportFile(blob,fileName);
            if(this.failcount > 0 && this.succount > 0){//部分成功
                this.tipsDialog.showCancel = true;
                this.tipsDialog.tipsContent= `${this.succount}份文件下载成功，剩余${this.failcount}份文件下载失败。`;
                this.$refs.TipsDialog.show();
            }
            if(this.failcount == 0 && this.succount > 0){//全部成功
                Message({
                    message:'下载成功',
                    type:"success",
                    duration:5*1000
                  });
            }
        },
        exportFile(blob,fileName) {
            let reader = new FileReader();
            console.log('blob',blob)
            reader.readAsDataURL(blob)
            reader.onload = (e) => {
                // console.log('e',e)
                let a = document.createElement('a');
                a.download = fileName;
                let url = window.URL.createObjectURL(blob)
                // a.href = e.target.result;
                a.href = url;
                document.body.appendChild(a)
                a.click();
                URL.revokeObjectURL(url) // 释放内存
            }
        },
    }
}