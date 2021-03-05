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
                    <a class="list-ctrl" :class="{ 'hadView':scope.row.hadView }" @click="view(scope.row.id,scope.$index)">查看</a>
                </template>
            </el-table-column>
        </el-table-column>
        <el-table-column :render-header="pHeader" width="auto">
            <el-table-column label="合同编号" width="200" fixed="left">
                <template slot-scope="scope">
                    <a class="list-ctrl" @click="view(scope.row.id)">{{scope.row.protocolNo}}</a>
                </template>
            </el-table-column>
            <el-table-column label="签署合同" width="190">
                <template slot-scope="scope">
                    <a class="list-ctrl" @click="view(scope.row.id)">{{ scope.row.protocolName?`《${scope.row.protocolName}》`:'--' }}</a>
                </template>
            </el-table-column>
            <el-table-column prop="protocolType" label="合同类型" width="200"></el-table-column>
            <el-table-column prop="signTime" label="签署时间" width="200" sortable></el-table-column>
        </el-table-column>
		<el-table-column label="贷款信息" width="auto">
            <el-table-column label="申请编号" width="220">
                <template slot-scope="scope">
                    {{ scope.row.applyNo | noNull }}
                </template>
            </el-table-column>
            <el-table-column label="贷款账号" width="220">
                <template slot-scope="scope">
                    {{ scope.row.loanAccount | noNull }}
                </template>
            </el-table-column>
            <el-table-column label="案件编号" width="220">
                <template slot-scope="scope">
                    {{ scope.row.caseNo | noNull }}
                </template>
            </el-table-column>
            <el-table-column label="产品名称" width="auto">
                <template slot-scope="scope">
                    {{ scope.row.productName | noNull }}
                </template>
            </el-table-column>
            <el-table-column label="产品编码" width="120">
                <template slot-scope="scope">
                    {{ scope.row.productNo | noNull }}
                </template>
            </el-table-column>
            <el-table-column label="渠道名称" width="120">
                <template slot-scope="scope">
                    {{ scope.row.channelName | noNull }}
                </template>
            </el-table-column>
            <el-table-column label="渠道号" width="220">
                <template slot-scope="scope">
                    {{ scope.row.channelNo | noNull }}
                </template>
            </el-table-column>
            <el-table-column prop="overdueDay" :render-header="dHeader" width="150" sortable>
                <template slot-scope="scope">
                    {{scope.row.overdueDay?`${scope.row.overdueDay}天`: '--'}}
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
import { protocolList } from '@/api/quickSearch';
import TipsDialog from '@/components/Dialog/tipsDialog';
import PurposeDialog from '@/components/Dialog/purposeDialog';
import Pagination from '@/components/Pagination/index';
import { pbatchDownloadUrl } from '@/utils/constant';
import batchDownLoadFile from '@/views/mixins/batchDownLoadFile';
import { pFileCheck } from '@/api/protocolMng';
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
            return this.$route.params.queryParam;
        },
    },
    activated(){
        this.permission_btns = this.$route.params.permission_btns
        this.query()
    },
    methods:{
        getIDs(){
            let idArr = []
            for(let i=0;i<this.tabelData.length;i++){
                idArr.push(this.tabelData[i].id)
            }
            return idArr;
        },
        view(id,index){
            let par = {
                fileId:id
            }
           pFileCheck(par).then(res => {
            if(res.resCode && res.resCode === '2000'){
                //跳转协议查看
                this.gotoDetail(id,index);
            }
           })
        },
        gotoDetail(id,index){
            if(index !== undefined){
                // this.$set(this.tabelData[index],'hadView',true)
                this.tabelData[index].hadView = true;
                console.log('12view,index',this.tabelData)
                this.$forceUpdate()
            }
            let los = 'plProID';
            localStorage.removeItem(los)
            localStorage.setItem(los,JSON.stringify(this.getIDs()));
            let account = this.$store.state.user.username;
            var { href } = this.$router.resolve({
                path: '/fileDetail',
                query: {
                    docid: id,
                    queryCount:this.queryCount,
                    type:'protocol',
                    store:los,
                    cname:'plQC',
                    account:account,
                    permission_btns: this.permission_btns,
                    downLoadPermission: 'downloadQuickIndex',
                    detailPermission: 'quickIndexDetail'
                }
            });
            let sonWin = window.open(href, '_blank');
        },
        query(){
            try {
                let par = this.queryParam;
                console.log('par',par)
                let param = {
                    list:[{
                        customerNo:this.userNo,
                        customerIdNumber:par.list[0].cardId,
                        customerMobile:par.list[0].phoneNo,
                        loanAccount:par.list[0].accountNo,
                        caseNo:par.list[0].caseNo,
                        applyNo:par.list[0].applyNo,
                        channelNo:par.list[0].channelNo,
                        productNo:par.list[0].productNo,
                        overdueDayMin:par.list[0].overDueDayMin,
                        overdueDayMax:par.list[0].overDueDayMax,
                        signStartTime:par.list[0].signStartTime,
                        signEndTime:par.list[0].signEndTime,
                    }],
                    ...this.paginationParam,
                }
                const res = protocolList(param).then(res => {
                    this.tabelData = res.resData.list;
                    this.paginationParam.total = res.resData.total;
                    this.tabelData.forEach(item => {
                        item.hadView = false;
                    })
                    this.queryCount +=1;
                    localStorage.setItem('plQC',this.queryCount);
                });
            } catch (error) {
                console.log(error)
                this.rollBack();
            }
        },
        pHeader(h, { column, $index },index){
           return h('span', {}, [
            h('span', {}, '协议信息'),
            h('el-tooltip',
                { props:{style:'position:absolute;right:0;',class:'item',effect:'dark',placement:'top'}},
                [
                    h('div',{ slot:'content',class:'bg78' },[
                        h('p',{},'协议可查范围:'),
                        h('p',{},'1、截止当前时刻，自营渠道已签署协议数据'),
                        h('p',{},'2、截止前一日，第三方渠道已签署协议数据'),
                    ]),
                    h('i',{ class:'el-icon-question table-msg'})
                ]
            )
           ])
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
        confirmPurpose(purpose){
            this.tipsDialog.showCancel = true;
            this.tipsDialog.cancelTxt = '查看详情';
            let contractList = this.getProtocolList()
            console.log('contractList',contractList)
            this.batchDownLoadFile(pbatchDownloadUrl,{downPuerpos:purpose,fileType:'1',contractList },'post')
        },
        getProtocolList(){
            let protocolList  =[]
            this.selectRow.forEach(row => {
                let item = {}
                let { id } = this.tabelData[row];
                item.fileId = id;
                protocolList.push(item)
            });
            return protocolList
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