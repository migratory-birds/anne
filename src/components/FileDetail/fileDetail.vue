<template>
    <div class="wrap">
        <div class="controler-wrapper">
            <div class="title">
                {{isPro?'协议查看':'存证查看'}}
            </div>
            <div class="controler">
                <el-button v-if="showPrev && handlePermission(detailPermission)" @click="goPage('last')" :disabled="disabled" round>上一份</el-button>
                <el-button v-if="showNext && handlePermission(detailPermission)" @click="goPage('next')" :disabled="disabled" round>下一份</el-button>
                <el-button @click="showDialog" v-if="handlePermission(downLoadPermission)" round>下载</el-button>
            </div>
        </div>
        <div v-show="showPdf" id="pdf-container" class="pdf-container">
        </div>
        <canvas ref="watermark" class="watermark"></canvas>
        <div class="page-control" id="page-control">
            第{{ pageNum }}/共 {{ pageCount }}页
        </div>
        <PurposeDialog ref="PurposeDialog" @confirm="downFile">
        </PurposeDialog>
    </div>
</template>

<script>
import * as  pdfjsLib from 'pdfjs-dist/es5/build/pdf.js'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'
import { deepCopy } from '@/utils/index';
import { protocolDetail,contractDownload } from '@/api/protocolMng';
import PurposeDialog from '@/components/Dialog/purposeDialog';
import { downLoadFile } from '@/utils/index';
import { cdownLoadFile,pdownLoadFile  } from '@/utils/constant'

export default {
    data() {
        return {
            pdfDoc: null, // pdfjs 生成的对象
            pageNum: 1, // 当前页数
            pageCount: 0, // 总页数
            disabled:false,
            proID:[],
            creID:[],
            scrollTimer:null,
            hadViewMap:new Map(),//存贮已经查看过的页面id,及页面位置，{ id:location}
            nowId:'',
            Base64Str:'',
            array:[],
            isPro:false,
            isCer:false,
            singleH:0,
            singleW:0,
            fileId:'',
            scale:2.5,
            permission_btns: [],
            showPdf:true
        };
    },
    components:{
        PurposeDialog,
    },
    computed: {
        docid() {
            return this.$route.query.docid;
        },
        showPrev(){
            return this.fileId !== this.firstItem;
        },
        showNext(){
            return this.fileId !== this.lastItem;
        },
        firstItem(){
            if(this.isPro && this.proID.length > 0){
                return this.proID[0];
            } else if(this.isCer && this.creID.length > 0){
                return this.creID[0];
            } else {
                return; 
            }
        },
        lastItem(){
            if(this.isPro && this.proID.length > 0){
                let len = this.proID.length;
                return this.proID[len -1];
            } else if(this.isCer && this.creID.length > 0){
                let len = this.creID.length;
                return this.creID[len -1];
            }
        },
        scrollTop(){
           return  document.getElementById('page-control').scrollHeight;
        },
    },
    async created() {
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    },
    async mounted(){
        this.permission_btns = this.$route.query.permission_btns || []
        // 下载按钮权限名称
        this.downLoadPermission = this.$route.query.downLoadPermission || ''
        // 上一页下一页按钮权限名称
        this.detailPermission = this.$route.query.detailPermission || ''
        this.isPro = this.$route.query.type == 'protocol';
        this.isCer = this.$route.query.type == 'certification';
        if(this.isPro){
            this.proID = deepCopy(JSON.parse(localStorage.getItem(this.$route.query.store)));
        }
        if(this.isCer){
            this.creID = deepCopy(JSON.parse(localStorage.getItem(this.$route.query.store)));
        }
        this.fileId = this.$route.query.docid;
        let self = this;
        let oldQueryCount= self.$route.query.queryCount;
        window.addEventListener("storage", function (e) {
            console.log('eee',e,e.newValue,oldQueryCount);
            if(e.key === self.$route.query.cname){
                if(e.newValue !== oldQueryCount){
                    self.disabled = true;
                }
            }    
        });
        window.addEventListener("scroll",this.handleScroll);
        let isClosed = setInterval(()=> {
            if(!window.opener){
                this.disabled = true;
                clearInterval(isClosed)
                console.log('opener closed');
            }
        },1000);
        await this.getPdfFile(this.fileId);
    },
    methods: {
        scrollTo(id){
            const has = this.hadViewMap.has(id);
            console.log('id',id)
            console.log('has',has,this.hadViewMap);
            if(has){
                const y = this.hadViewMap.get(id);
                console.log('in viewMap,to y',y)
                document.documentElement.scrollTo(0,y)
            } else {
                console.log('not in viewmap,to 0,0')
                document.documentElement.scrollTo(0,0);
            }
        },
        // 获取文件
        getPdfFile(fileId) {
            console.log('fileId',fileId)
            let par = {
                fileId:fileId || this.docid  
            }
            let self = this;
            if(this.isCer){
                contractDownload(par).then(res => {
                    console.log('res=',res)
                   this.handleGoPage(res);
                })
            } else if(this.isPro){
                protocolDetail(par).then(res => {
                    console.log('res=',res)
                    this.handleGoPage(res);
                })
            }
        },
        handleGoPage(res){
            if(res.resCode && res.resCode === '2000'){
                this.Base64Str = res.resData.base64;
                this.loadPDF();
                this.showPdf = true;
            } else {
                this.showPdf = false;
            }
        },
        // 初始化pdf
        loadPDF() {
            let _this = this;
           let par =  {
                data: atob(this.Base64Str),
                // cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.5.207/cmaps/',
                cMapUrl: process.env.NODE_ENV !== "production" ? './cmaps/':'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.5.207/cmaps/',
                cMapPacked: true
            }
            pdfjsLib.getDocument(par).promise.then(function (pdfDoc_) {
                // console.log('pfg',pdfDoc_)
                _this.pdfDoc = pdfDoc_;
                _this.pageCount = _this.pdfDoc._pdfInfo.numPages;//总页数
                let idTemp ='cw-pdf-';
                let id = ''
                _this.createCanvas(_this.pageCount,idTemp)
                for(let i=1;i<= _this.pageCount;i++){
                    id = idTemp +i;
                    _this.renderPage(i,id)
                }
            });
        },
        // 渲染pdf
        renderPage(num,cavId) {
            const _this = this;
             var canvas = document.getElementById(cavId);
            // Using promise to fetch the page
            this.pdfDoc.getPage(num).then(function (page) {
                // console.log('page',page)
                 var scale = 1.5;
                var viewport = page.getViewport({scale: scale});//要传入正确的参数，不然文档会倒过来，viewport的宽高会是0
                // console.log('view',viewport)
                canvas.height = viewport.height;
                _this.singleH = viewport.height;
                canvas.width = viewport.width;
                _this.singleW = viewport.width;
                let ctx = canvas.getContext("2d")
                ctx.fillStyle ="#ffffff";
                var renderContext = {
                    canvasContext: ctx,
                    viewport: viewport,
                };
                let renderTask = page.render(renderContext);
                _this.createWatermark();
                renderTask.promise.then(function () {
                    ctx.fillStyle = ctx.createPattern(
                        _this.$refs.watermark,
                        "repeat"
                    );
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                });
            });
        },
        // 水印
        createWatermark() {
            const canvas = this.$refs.watermark;
            const width = 1100;
            const height = 260;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.scale(this.scale, this.scale);
            ctx.clearRect(0, 0,width , this.singleH); //画布清除
            ctx.rotate((-10 * Math.PI) / 180);
            ctx.fillStyle = "rgba(100,100,100,0.1)";
            ctx.font = "18px 黑体";
            let date =new Date();
            const YY = date.getFullYear();
            let MM = (date.getMonth() +1 < 10? '0' + (date.getMonth()+1) : date.getMonth() + 1);
            let DD = (date.getDate() < 10 ? '0'+date.getDate(): date.getDate());
            ctx.fillText(`${YY}${MM}${DD} ${this.$route.query.account} 中邮消费金融有限公司`, -10, 100);
            ctx.rotate("10*Math.PI/180"); //坐标系还原
        },
        goPage(type){
            document.getElementById('pdf-container').innerHTML = ""; 
            if(this.isPro){
                let lastIdx = this.proID.indexOf(this.fileId) - 1;
                let nextIdx = this.proID.indexOf(this.fileId) + 1;
                console.log('this.fileId',this.fileId)
                console.log('lastIdx',lastIdx,'nextIdx',nextIdx)
                this.fileId = type === 'last'? this.proID[lastIdx]:this.proID[nextIdx];
            } else {
                let lastIdx = this.creID.indexOf(this.fileId) - 1;
                let nextIdx = this.creID.indexOf(this.fileId) + 1;
                this.fileId = type === 'last'? this.creID[lastIdx]:this.creID[nextIdx];
            }
            this.markTag();
            this.getPdfFile(this.fileId);
            //跳转相应位置
            this.scrollTo(this.fileId);  
        },
        markTag(){
            //标记已经预览的文档的位置
            let localtion = document.documentElement.scrollTop|| document.body.scrollTop || window.pageYOffset;
            // console.log('body',document.body.scrollTop,'page',window.pageYOffset)
            // console.log('location',location)
            // console.log('this.fileId',this.fileId)
            this.hadViewMap.set(this.fileId,localtion);
            console.log(this.hadViewMap)
        },
        showDialog(){
            this.$refs.PurposeDialog.show()
        },
        handleScroll(){
            // console.log('scroll')
            let dom = document.getElementById('page-control');
            // console.log(dom.classList)
            if(Array.from(dom.classList).indexOf('moveOut') > -1){
                dom.classList.remove("moveOut");
            }
            if(Array.from(dom.classList).indexOf('moveIn') === -1){
                dom.classList.add("moveIn");
            }
            let self = this;
            clearTimeout(this.scrollTimer);
            this.scrollTimer = setTimeout(() => {
              // todo something scroll end
              dom.classList.remove("moveIn");
              dom.classList.add("moveOut");
            }, 2000); 
            let sct = document.documentElement.scrollTop - 88.5;
            // console.log('=====滚动高度======',sct)
            // console.log('单页面高度',this.singleH)
            let plusNum = sct / this.singleH;
            // console.log('plusNum',plusNum)
            if(plusNum < 1){
                if(plusNum > 0.6){
                    console.log('plusNum >0.6')
                    plusNum = 2;
                } else {
                    console.log('plusNum <0.6')
                    plusNum = 1;
                }
            } else if(plusNum > 1){
                let intNum = parseInt(plusNum);
                let smallNum = plusNum - intNum;
                plusNum = parseInt(plusNum)
                plusNum = plusNum +1
                if(smallNum > 0.6){
                    plusNum +=1;
                }
            }
            this.pageNum = plusNum;
            // console.log('当前页数',this.pageNum)
        },
        //下载pdf文件
        downFile(purpose){
            let params = {
                fileId:this.fileId ||this.$route.query.docid,
                fileType:this.isPro?'1':'2',//'1':电子协议 '2':电子凭证
                downPuerpos:purpose
            }
            let url = this.isPro?pdownLoadFile:cdownLoadFile;
            downLoadFile(url,params,'post');
            this.$refs.PurposeDialog.setDowned();
            this.$refs.PurposeDialog.hide();
        },
        createCanvas(num,temp){
            let id = '';
            for(let j=1;j<=num;j++){
                id = temp +j;
                this.createPdfContainer(id,'pdf-singlePage');
            }
        },
        createPdfContainer(id,className){
            const pdfC = document.getElementById('pdf-container');
            let cav = document.createElement('canvas');
            cav.id = id;
            cav.className = className;
            pdfC.appendChild(cav);
        },
        handlePermission(permission){
            return this.permission_btns.indexOf(permission) > -1;
        }
    },
    beforeDestroy(){
        window.removeEventListener("storage",()=>{});
        window.removeEventListener("scroll",()=>{});
    },
};
</script>

<style lang="scss" scoped>
$barHeight:78.5px;
.wrap {
    position: relative;
    background-color: #F3F6FD;
    display: flex;
    flex-direction: column;
    .pdf-container {
        position: relative;
        flex: 1;
        text-align: center;
        min-height: calc(150vh - 78.5px);
        margin-top: 88.5px;
        // background-color: rgba(0,0,0,0.2);
        .watermark {
            display: none;
        }
    }
    .page-control {
        position: fixed;
        top: 500px;
        // right:0;
        right:-193px;
        width: 193px;
        height: 80px;
        line-height: 80px;
        background: #000000FF;
        opacity: .6;
        text-align: center;
        font-size: 14px;
        color: #fff;
        border-radius: 6px;
    }
}
.controler-wrapper{
    position: fixed;
    width: 100%;
    height: $barHeight;
    line-height: $barHeight;
    background: #7baef4;
    z-index: 99;
    .title,.controler{
        display: inline-block;
        height: 100%;
    }
    .title{
        color:#fff;
        font-size: 24px;
        margin-left: 56px;
    }
    .controler{
        position: absolute;
        right:40px;
}
}
@keyframes slideIn {
    from{right:-193px}
    to{right:0}
}
@keyframes slideOut {
    from{right:0}
    to{right:-193px}
}
.moveIn{
    animation:slideIn .5s linear forwards;
}
.moveOut{
    animation:slideOut .5s linear forwards;
}
.watermark {
    display: none;
    // background:wheat;
    width:892px;
    height: 270px;
}
</style>
<style>
.controler .el-button{
    color: #488FF0;
}
.controler .el-button+.el-button{
    margin-left: 15px;
}
.pdf-singlePage{
    display: block;
    margin: 0 auto;
    margin-bottom:10px;
}
</style>