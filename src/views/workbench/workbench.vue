<template>
    <div @keyup.enter="query(1)">
        <div class="panel">
            <div class="panel-title"><span class="panel-title-b"></span><span class="panel-title-t mar20">下载统计</span><span>截止时间:{{downloadSummary.updateTime}}</span></div>
            <div class="download-container">
                <div class="download-item item-one">
                    <div class="number">{{ downloadSummary.downloadTotal }}</div>
                    <div class="detail">下载总量</div>
                </div>
                <div class="download-item item-two">
                    <div class="number">{{ downloadSummary.downloadTotalProtocol }}</div>
                    <div class="detail">协议下载数量</div>
                </div>
                <div class="download-item item-three">
                    <div class="number">{{ downloadSummary.downloadTotalContract }}</div>
                    <div class="detail">存证下载数量</div>
                </div>
            </div>
        </div>
        <div class="panel search-panel">
            <div class="panel-title"><span class="panel-title-b"></span><span class="panel-title-t">协议查询</span></div>
            <el-form ref="form" :model="queryParam" :rules="rules" :inline="true" label-width="100px">
                <el-form-item label="下载时间" prop="downTime">
                    <el-date-picker 
                    v-model="queryParam.downTime" 
                    type="datetimerange" 
                    :picker-options="pickerBegin" 
                    :clearable="false"
                    :default-time="['00:00:00', '23:59:59']"
                    range-separator="至" 
                    start-placeholder="请选择开始时间" 
                    end-placeholder="请选择结束时间">
                    </el-date-picker>
                </el-form-item>
                 <el-form-item label="下载状态">
                    <el-select v-model="queryParam.downloadStatus" placeholder="查询全部" clearable>
                        <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="下载对象">
                    <el-select v-model="queryParam.type" placeholder="存证/协议">
                        <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" plain @click="reset()" round>重置</el-button>
                    <el-button type="primary" @click="query(1)" round>查询</el-button>
                </el-form-item>
            </el-form>
            <div>
               
            </div>
        </div>
        <div class="panel">
            <div class="panel-operation-container barRela pagination-wrap">
                <span class="panel-title-b"></span><span class="marl17">下载记录</span>
                <Pagination :total="paginationParam.total" :page.sync="paginationParam.pageNum" :limit.sync="paginationParam.pageSize" :page-sizes="[10,20,30]"  @pagination="handlePagination" setAlign="right"></Pagination>
            </div>
            <el-table :data="tabelData" border style="width: 100%" empty-text="未查询到任何记录" @sort-change="sortChange">
				<el-table-column type="index" label="序号" width="60" fixed></el-table-column>
                <el-table-column prop="downloadTime" label="下载时间" width="200" sortable></el-table-column>
                <el-table-column  prop="downloadStatus" label="下载状态" width="200">
                    <template slot-scope="scope">
                        {{ getNameByKey(statusList,scope.row.downloadStatus) }}
                    </template>
                </el-table-column>
                <el-table-column  prop="type" label="下载对象" width="300">
                    <template slot-scope="scope">
                        {{ getNameByKey(objList,scope.row.type) }}
                    </template>
                </el-table-column>
                <el-table-column prop="num" label="协议/存证编号" width="auto">
                    <template slot-scope="scope">
                        <a class="list-ctrl" @click="view(scope.row.protocolId,scope.row.type)">{{ scope.row.num }}</a>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="协议/存证名称" width="auto">
                    <template slot-scope="scope">
                        <a class="list-ctrl" @click="view(scope.row.protocolId,scope.row.type)">{{ scope.row.name }}</a>
                    </template>
                </el-table-column>
                <el-table-column prop="purpose" label="下载用途" width="auto"></el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
import { downloadSummary,downloadRecord } from '@/api/workbench';
import Pagination from '@/components/Pagination/index';
import { shortcuts,typeList,statusList,objList } from '@/utils/constant';
import { formatDate,getZeroTime,getEndTime} from '@/utils/index';
import { protocolDetail,contractDownload } from '@/api/protocolMng';
import { Message } from "element-ui";
import { mapState } from 'vuex'
export default {
    name:'workbench',
    components:{
        Pagination,
    },
    computed: {
        ...mapState({
            permission_btns: state => state.permission.btns
        }),
    },
    data(){
        return {
            downloadSummary:{
                downloadTotal:'',
                downloadTotalProtocol:'',
                downloadTotalContract:'',
                updateTime:''
            },
            queryParam:{
                downTime:'',
                downloadStatus:'all',
                type:'',
                order:'1'
            },
            downloadStatusTimer:null,
            //轮询时间
            downloadStatusTime:1000,
            pickerBegin:{
                shortcuts: shortcuts,
            },
            rules:{
                "downTime":[
                    { required:true, validator:(rules,value,callback)=> {
                        if(!value || !value[0] || !value[1]){
                            return callback(new Error('请选择开始时间和结束时间'))
                        }
                        if(value[0] > value[1]){
                            return callback(new Error('结束时间不可早于开始时间'))
                        }
                        return callback()
                    }, trigger: ['blur','change']}
                ]
            },
            tabelData:[],
            paginationParam:{
                total:0,
                pageNum:1,
                pageSize:10
            },
            typeList:typeList,
            statusList:statusList,
            objList:objList,
            queryCount:0,//点击查询按钮次数
            saveSort:''
        }
    },
    beforeRouteEnter(to,from,next){
        next(vm => {
            if (vm.downloadStatusTimer) {
                clearTimeout(vm.downloadStatusTimer);
                // console.log('before clearTimeout',vm.downloadStatusTimer)
            }
            vm.getDownloadSummary(vm.downloadStatusTime);
        })
    },
    beforeRouteLeave(to,from,next){
        // console.log('beforeRouteLeave')
        if (this.downloadStatusTimer) {
            clearTimeout(this.downloadStatusTimer);
            console.log('clearTimeout',this.downloadStatusTimer)
        }
        next();
    },
    mounted(){
        this.init();
        this.query(1)
    },
    methods:{
        // 轮询接口
        async getDownloadSummary(time) {
            const res = await downloadSummary({},{ loadingFlag:false});
            if (res) {
                // console.log('getDownloadSummary res',res)
              let resData = res.resData;
              this.downloadSummary.downloadTotal = resData.downloadTotal;
              this.downloadSummary.downloadTotalProtocol = resData.downloadTotalProtocol;
              this.downloadSummary.downloadTotalContract = resData.downloadTotalContract;
              this.downloadSummary.updateTime = resData.updateTime;
            //   console.log('this.downloadSummary',this.downloadSummary)
              this.downloadStatusTimer = setTimeout(async () => {
                this.getDownloadSummary(time);
              }, time);
            //   console.log('this.downloadStatusTimer',this.downloadStatusTimer)
            }
        },
        init(){
            this.getDefaltTime()
            this.queryParam.downloadStatus = '';
            this.queryParam.order = '1';
        },
        getDefaltTime(){
            let timestamp = new Date().getTime() - 3600 * 1000 * 24 * 6;
            const start = getZeroTime(timestamp);
            const date = new Date();
            const end = getEndTime(date.getTime());
            this.queryParam.downTime = [start,end]
        },
        async query(pageNum){
            if(pageNum){
                this.paginationParam.pageNum  = pageNum;
            }
            this.$refs.form.validate(async valid => {
                if(valid){
                    console.log('valid');
                    try {
                        let params ={
                            ...this.queryParam,
                            pageNum:pageNum ||this.paginationParam.pageNum,
                            pageSize:this.paginationParam.pageSize,
                        }
                        console.log('params',params)
                        params.beginTime = formatDate(this.queryParam.downTime[0])
                        params.endTime = formatDate(this.queryParam.downTime[1])
                        if(params.type === '3'){
                            params.type = ''
                        }
                        let res = await downloadRecord(params);
                        console.log('list res',res)
                        let list = res.resData.list;
                        this.tabelData = list;
                        this.paginationParam.total = res.resData.total;
                        this.queryCount +=1;
                        localStorage.setItem('wbQC',this.queryCount);
                    } catch (error) {
                        this.rollBack()
                    }

                }
            })
        },
        reset(){
            for(let key in this.queryParam){
                this.queryParam[key] = '';
            }
            this.init();
        },
        getIDs(){
            let idArr = []
            for(let i=0;i<this.tabelData.length;i++){
                idArr.push(this.tabelData[i].protocolId)
            }
            console.log('idArr',idArr)
            return idArr;
        },
        view(id,type){
             let par = {
                fileId:id
            }
            if(type === '2'){
                contractDownload(par).then(res => {
                    this.handleRes(res,id,type)
                })
            } else if(type === '1'){
                protocolDetail(par).then(res => {
                    this.handleRes(res,id,type)
                })
            }
        },
        handleRes(res,id,type){
            if(res.resCode && res.resCode === '2000'){
                //跳转协议查看
                this.gotoDetail(id,type);
            }
        },
        gotoDetail(id,type){
            //跳转协议查看或者合同查看
            let los= ''
            if(type ==  '1'){
                //协议
                los = 'wbProID'
            } else if(type == '2'){
                //存证
                los = 'wbCreID'
            }
            localStorage.removeItem(los);
            localStorage.setItem(los,JSON.stringify(this.getIDs()));
            let account = this.$store.state.user.username;
            var { href } = this.$router.resolve({
                path: '/fileDetail',
                query: {
                    docid: id,
                    queryCount:this.queryCount,
                    type:type === '1'?'protocol':'certification',
                    store:los,
                    cname:'wbQC',
                    account:account,
                    permission_btns: this.permission_btns,
                    // downLoadPermission: 'downloadContract',
                    // detailPermission: 'contractDetail'
                }
            });
            let sonWin = window.open(href, '_blank');
        },
        handlePagination(data){
            //当前页
            this.paginationParam.pageNum = data.page;
            this.paginationParam.pageSize = data.limit;
            let pageNum = data.page
            setTimeout(()=> {
                this.query(pageNum);
            },500);
        },
        sortChange(row){
            //升：ascending 降：descending
            if (row.order === null) {
                this.saveSort === 'descending' ? row.order = 'ascending' : row.order = 'descending'
                row.column.order = row.order
            }
            this.saveSort = row.order;
            let orderMap = new Map();
            orderMap = {
                ascending:'0',
                descending:'1'
            }
            this.queryParam.order = orderMap[row.order];
            this.query()
        },
    },
}
</script>
<style lang="scss" scoped>
.panel-title{
    .mar20{
        margin-right: 20px;
    }
}
.barRela{
    position: relative;
}
.marl17{
    margin-left: 17px;
    font-size: 16px;
}
.download-container{
    // display: flex;
    // justify-content: center;
    padding-left: 20px;
    color: #999999;
    .item-one,.item-two,.item-three{
        box-shadow: 0 5px 15px 0  rgba(186, 186, 186, 0.3);
    }
    .item-one:hover{
        box-shadow: 0 5px 15px 0  rgba(38, 158, 251, 0.3);
        color:rgba(66, 141, 244, 1);
    }
    .item-two:hover{
        box-shadow: 0 5px 15px 0  rgba(255, 186, 53, 0.3);
        color:rgba(255, 187, 57, 1);
    }
    .item-three:hover{
        box-shadow: 0 5px 15px 0  rgba(145, 218, 194, 0.3);
        color: rgba(145, 218, 194, 1);
    }
    .download-item{
        display: inline-block;
        width: 340px;
        height: 146px;
        border-radius: 6px;
        margin-top: 20px;
        margin-bottom: 40px;
        margin-right: 53px;
        // line-height: 80px;
        text-align:center;
        .number{
            font-size: 40px;
            font-weight: bold;
            padding-top: 43px;
          
        }
    }
}
.search-panel{
    .title{
        font-size: 18px;
    }
}
.num{
    color:black;
}
</style>