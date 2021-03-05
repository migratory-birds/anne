<template>
<div>
<div class="panel">
    <div class="panel-operation-container pagination-wrap">
        <div v-show="tabelData.length > 0" v-if="handlePermission('downloadQuickIndex')" class="panel-operation-container-selectAll">
            <el-checkbox v-model="isSelectAll" @change="selectAll">全选</el-checkbox><span class="panel-operation-container-selectAll-c">共选中{{ multiSelection.length }}条记录</span>
            <el-button type="primary" @click="batchLoad" round size="small">批量下载</el-button>
        </div>
        <Pagination :total="paginationParam.total" :page.sync="paginationParam.pageNum" :limit.sync="paginationParam.pageSize" :page-sizes="[10,20,30]"  @pagination="handlePagination" setAlign="right"></Pagination>
    </div>
    <el-table ref="table" :fit="true" :data="tabelData" border height="400" style="width:auto;overflow:auto;" empty-text="未查询到任何记录" @selection-change="handleSelectionChange" :row-style="selectedHighlight" class="Table">
        <el-table-column label="" width="120" fixed>
            <el-table-column type="selection" v-if="handlePermission('downloadQuickIndex')" label="选择" width="60" label-class-name="hideSelection" ></el-table-column>
            <el-table-column label="操作" v-if="handlePermission('quickIndexDetail')" width="70">
                <template slot-scope="scope">
                        <a class="list-ctrl" :class="{ 'hadView':scope.row.hadView }" @click="view(scope.row.fileId,scope.$index)">查看</a>
                </template>
            </el-table-column>
        </el-table-column>
        <el-table-column label="存证信息" width="auto">
            <el-table-column label="存证名称" width="200" fixed="left">
                <template slot-scope="scope">
                    <a class="list-ctrl" @click="view(scope.row.fileId)">{{scope.row.contractName}}</a>
                </template>
            </el-table-column>
            <el-table-column label="存证编号" width="220">
                <template slot-scope="scope">
                    <a class="list-ctrl">{{ scope.row.contractNo | noNull }}</a>
                </template>
            </el-table-column>
            <el-table-column label="存证状态" width="200">
                <template slot-scope="scope">
                    {{ getNameByKey(statusMap,scope.row.contractStatus) }}
                </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="200" sortable></el-table-column>
        </el-table-column>
		<el-table-column label="贷款信息" width="auto">
            <el-table-column label="申请编号" width="220">
                <template slot-scope="scope">
                    {{ scope.row.applyNo | noNull }}
                </template>
            </el-table-column>
            <el-table-column label="贷款账号" width="220">
                <template slot-scope="scope">
                    {{ scope.row.accountNo | noNull }}
                </template>
            </el-table-column>
            <el-table-column label="案件编号" width="220">
                <template slot-scope="scope">
                    {{ scope.row.caseNo | noNull }}
                </template>
            </el-table-column>
            <el-table-column label="产品名称" width="180">
                <template slot-scope="scope">
                    {{ scope.row.productName | noNull }}
                </template>
            </el-table-column>
            <el-table-column label="产品编码" width="120">
                <template slot-scope="scope">
                    {{ scope.row.productNo | noNull }}
                </template>
            </el-table-column>
            <el-table-column label="渠道号" width="220">
                <template slot-scope="scope">
                    {{ scope.row.channelNo | noNull }}
                </template>
            </el-table-column>
            <el-table-column prop="channelName" label="渠道名称" width="220">
                <template slot-scope="scope">
                    {{ scope.row.channelName | noNull }}
                </template>
            </el-table-column>
            <el-table-column prop="overDueDay" :render-header="dHeader" width="150" sortable>
                <template slot-scope="scope">
                    {{scope.row.overDueDay?`${scope.row.overDueDay}天`: '--'}}
                </template>
            </el-table-column>
        </el-table-column>

    </el-table>
</div>
    <TipsDialog ref="TipsDialog" confirmTxt="我知道了" @cancel="goto" :showCancel="tipsDialog.showCancel" :cancelTxt="tipsDialog.cancelTxt">
        <template v-slot:content>
            {{ tipsDialog.tipsContent }}
        </template>
    </TipsDialog>
    <PurposeDialog ref="PurposeDialog" @confirm="confirmPurpose">
    </PurposeDialog>
</div>
</template>
<script>
import pagiMix from '@/views//mixins/pagiMix';
import batchDownLoadFile from '@/views/mixins/batchDownLoadFile';
import { contractList, } from '@/api/quickSearch';
import TipsDialog from '@/components/Dialog/tipsDialog';
import PurposeDialog from '@/components/Dialog/purposeDialog';
import Pagination from '@/components/Pagination/index';
import { StatusMap,cbatchDownloadUrl } from '@/utils/constant';
import { cFileCheck, } from '@/api/protocolMng';
import { Message } from "element-ui";
export default {
    name:'protocol',
    mixins:[pagiMix,batchDownLoadFile],
    components:{
        TipsDialog,
        PurposeDialog,
        Pagination,
    },
    data(){
        return {
            statusMap:StatusMap,
            queryCount:0,//点击查询按钮次数
            permission_btns: []
        }
    },
    computed:{
        userNo(){
            return this.$route.params.userNo;
        },
        userName(){
            return this.$route.params.userName;
        },
        queryParam(){
            console.log('conbsttparams',this.$route.params)
            return this.$route.params.queryParam;
        },
    },
    activated(){
        this.permission_btns = this.$route.params.permission_btns
        this.query(1)
    },
    methods:{
        getIDs(){
            let idArr = []
            for(let i=0;i<this.tabelData.length;i++){
                idArr.push(this.tabelData[i].fileId)
            }
            return idArr;
        },
        view(id,index){
            let par = {
                fileId:id
            }
           cFileCheck(par).then(res => {
            if(res.resCode && res.resCode === '2000'){
                //跳转协议查看
                this.gotoDetail(id,index);
            }
           })
        },
        gotoDetail(id,index){
            console.log('index',index)
            if(index !== undefined){
                console.log('true index')
                // this.tabelData[index].hadView = true;
                this.$set(this.tabelData[index],'hadView',true)
                console.log('hadView',this.tabelData[index].hadView)
            }
            let los = 'cCreID'
            localStorage.removeItem(los)
            localStorage.setItem(los,JSON.stringify(this.getIDs()));
            let account = this.$store.state.user.username;
            var { href } = this.$router.resolve({
                path: '/fileDetail',
                query: {
                    docid: id,
                    queryCount:this.queryCount,
                    type:'certification',
                    store:los,
                    cname:'cerQC',
                    account:account,
                    permission_btns: this.permission_btns, // 按钮权限集合
                    downLoadPermission: 'downloadQuickIndex',
                    detailPermission: 'quickIndexDetail'
                }
            });
            let sonWin = window.open(href, '_blank');
        },
        getPar(pageNum){
            let p = this.queryParam;
            let param = {
                list:[{
                    userId:this.userNo,
                    cardId:p.list[0].cardId,
                    phoneNo:p.list[0].phoneNo,
                    // contractNo:'',
                    // contractName:'',
                    // contractStatus:'',
                    caseNo:p.list[0].caseNo,
                    accountNo:p.list[0].accountNo,
                    applyNo:p.list[0].applyNo,
                    // channelNo:'',
                    overDueDayMin:p.list[0].overDueDayMin,
                    overDueDayMax:p.list[0].overDueDayMax,
                    updateTimeStart:p.list[0].signStartTime,
                    updateTimeEnd:p.list[0].signEndTime
                }],
                ...this.paginationParam,
            };
            param = param || this.paginationParam.this.paginationParam;
            return param;
        },
        query(pageNum){
            try {
                let param = this.getPar(pageNum)
                contractList(param).then(res => {
                    // console.log('res',res)
                    this.tabelData = res.resData.list;
                    this.paginationParam.total = res.resData.total;
                    this.tabelData.forEach(item => {
                        item.hadView = false;
                    })
                    this.queryCount +=1;
                    localStorage.setItem('cerQC',this.queryCount);
                });
            } catch (error) {
                console.log(error)
                this.rollBack();
            }
        },
        dHeader(h, { column, $index },index){
           return h('span', {}, [
            h('span', {}, '逾期天数'),
            h('el-tooltip',
                { props:{style:'position:absolute;right:0;',class:'item',effect:'dark',placement:'top'}},
                [
                    h('div',{ slot:'content',class:'bg78' },[
                        h('p',{},'逾期天数为当前日期前一天的统计结果。'),
                    ]),
                    h('i',{ class:'el-icon-question table-msg'})
                ]
            )
           ])
        },
        getProtocolList(){
            let protocolList  =[]
            this.selectRow.forEach(row => {
                let item = {}
                let { fileId } = this.tabelData[row];
                item.fileId = fileId;
                protocolList.push(item)
            });
            return protocolList
        },
        confirmPurpose(purpose){
            this.tipsDialog.showCancel = true;
            this.tipsDialog.cancelTxt = '查看详情';
            let contractList = this.getProtocolList()
            console.log('contractList',contractList)
            this.batchDownLoadFile(cbatchDownloadUrl,{downPuerpos:purpose,fileType:'2',contractList },'post')
        },
        goto(){
            this.$router.push({
                name:'workbench'
            })
        },
        handlePermission(permission){
            return this.permission_btns.indexOf(permission) > -1;
        }
    },
}
</script>
<style lang="scss" scoped>
.hadView{
    color:#ccc;
}
</style>
<style>
.bg78{
    /* background: #fff;
    color: red;
    border-color: #fff; */
}
.Table th,.Table td{
    height:24px;
    line-height:24px;
}
.Table .el-table .cell{
    white-space:nowrap;
    overflow: visible;  
}
</style>