<template>
<!-- 协议查询 -->
<div @keyup.enter="query()">
    <div class="panel">
        <div class="panel-title"><span class="panel-title-b"></span><span class="panel-title-t">协议查询</span></div>
        <el-form ref="form" :model="queryParam" :rules="rules" :inline="true" label-width="100px">
            <el-form-item label="客户姓名" prop="customerName">
                <el-input v-model="queryParam.customerName" placeholder="请填写客户姓名" maxlength="10" clearable></el-input>
            </el-form-item>
             <el-form-item label="身份证号" prop="customerIdNumber">
                <el-input v-model="queryParam.customerIdNumber" placeholder="请填写客户身份证号" maxlength="18" clearable></el-input>
            </el-form-item>
            <el-form-item label="手机号码" prop="customerMobile">
                <el-input v-model="queryParam.customerMobile" placeholder="请填写客户手机号码" maxlength="11" clearable></el-input>
            </el-form-item>
            <el-form-item label="客户编号">
                <el-input v-model="queryParam.customerNo" placeholder="请填写客户编号" maxlength="16" clearable></el-input>
            </el-form-item>
            <br/>
            <Select label="协议类型" v-model="queryParam.protocolTypes" :options="options"></Select>
            <el-form-item label="协议名称">
                <el-input v-model="queryParam.protocolName" placeholder="请填写协议名称（支持模糊查询）" maxlength="50" style="width:470px;" clearable></el-input>
            </el-form-item>
            <br/>
            <el-form-item label="申请编号" prop="applyNo">
                <el-input v-model="queryParam.applyNo" placeholder="请填写申请编号" maxlength="20" clearable></el-input>
            </el-form-item>
            <el-form-item label="案件编号">
                <el-input v-model="queryParam.caseNo" placeholder="请填写案件编号（BO号）" maxlength="20" style="width:200px;" clearable></el-input>
            </el-form-item>
            <el-form-item label="贷款账号">
                <el-input v-model="queryParam.loanAccount" placeholder="请填写贷款账号" maxlength="20" clearable></el-input>
            </el-form-item>
            <el-form-item label="渠道号">
                <el-select v-model="queryParam.channelNo" placeholder="查询全部" filterable clearable>
                    <el-option v-for="item in channelNoList" :key="item.channelNo" :label="item.channelNo" :value="item.channelNo"></el-option>
                </el-select>
            </el-form-item>
            <br/>
            <el-form-item label="逾期天数" prop="overdueDayMin">
                <el-input v-model="queryParam.overdueDayMin" placeholder="最小逾期天数" maxlength="10" class="form-input-inline" style="width:130px" clearable></el-input>
                <span> 天 - </span>
                <el-input v-model="queryParam.overdueDayMax" placeholder="最大逾期天数" maxlength="10" class="form-input-inline" style="width:130px" clearable></el-input>
                <span> 天</span>
            </el-form-item>
            <el-form-item label="签署时间" prop="dataOptions">
                <el-date-picker 
                    v-model="queryParam.dataOptions" 
                    type="datetimerange" 
                    value-format="timestamp"
                    :clearable="false"
                    :default-time="['00:00:00', '23:59:59']"
                    :picker-options="datePickerOptions" 
                    range-separator="至" 
                    start-placeholder="请选择开始时间" 
                    end-placeholder="请选择结束时间">
                </el-date-picker>
            </el-form-item>
            <input type="file" id="importFiles" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style="display:none" @change="uploadExcel"/>
            <el-button type="primary" @click="handleImport">+导入</el-button>
            <el-button type="primary" @click="downLoadExample">下载模板</el-button>
            <el-button type="primary" plain @click="reset" round>重置</el-button>
            <el-button type="primary" v-if="hasPerm('queryProtocolList')" @click="query('',1)" round>查询</el-button>
        </el-form>

    </div>
    <div class="panel">
        <div class="panel-operation-container pagination-wrap">
            <div v-show="tabelData.length > 0" v-if="hasPerm('downloadProtocol')" class="panel-operation-container-selectAll">
                <el-checkbox v-model="isSelectAll" @change="selectAll">全选</el-checkbox><span class="panel-operation-container-selectAll-c">共选中{{ multiSelection.length }}条记录</span>
                <el-button type="primary" @click="batchLoad" round size="small">批量下载</el-button>
            </div>
            <Pagination :total="paginationParam.total" :page.sync="paginationParam.pageNum" :limit.sync="paginationParam.pageSize" :page-sizes="[10,20,30]"  @pagination="handlePagination" setAlign="right"></Pagination>
        </div>
        <div class="table-container">
            <el-table ref="table" :data="tabelData" @cell-click="cellclick" :cell-style="tableCellStyle" border height="400" style="width:auto"  empty-text="未查询到任何记录" @selection-change="handleSelectionChange" :row-style="selectedHighlight" class="contractTable">
			<el-table-column label="" width="120" v-if="hasPerm('downloadProtocol') || hasPerm('protocolDetail')" fixed>
                <el-table-column type="selection" v-if="hasPerm('downloadProtocol')" label="选择" width="60" label-class-name="hideSelection"></el-table-column>
                <el-table-column v-if="hasPerm('protocolDetail')" label="操作" width="70">
                    <template slot-scope="scope">
                        <a class="list-ctrl" :class="{ 'hadView':scope.row.hadView }" @click="view(scope.row.id,scope.$index)">查看</a>
                    </template>
                </el-table-column>
            </el-table-column>
			<el-table-column :render-header="eHeader" width="auto">
                <el-table-column prop="index" label="序号" width="50"></el-table-column>
                <el-table-column  prop="protocolNo" label="协议编号" width="150">
                    <template slot-scope="scope">
                        <a v-if="hasPerm('protocolDetail')" class="list-ctrl" @click="view(scope.row.id)">{{ scope.row.protocolNo }}</a>
                        <div v-else>{{ scope.row.protocolNo }}</div>
                    </template>
                </el-table-column>
                <el-table-column  prop="protocolType" label="协议类型" width="120">
                    <template slot-scope="scope">
                        {{ getNameByKey(options,scope.row.protocolType)}}
                    </template>
                </el-table-column>
                <el-table-column label="协议名称" width="170">
                    <template slot-scope="scope">
                        <a v-if="hasPerm('protocolDetail')" class="list-ctrl" @click="view(scope.row.id)">{{ scope.row.protocolName?`《${scope.row.protocolName}》`:'--' }}</a>
                        <div v-else>{{ scope.row.protocolName?`《${scope.row.protocolName}》`:'--' }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="签署时间" width="180">
                    <template slot-scope="scope">
                        {{ scope.row.signTime | noNull }}
                    </template>
                </el-table-column>
            </el-table-column>
			<el-table-column label="贷款信息">
                <el-table-column label="申请编号" width="220">
                    <template slot-scope="scope">
                        {{ scope.row.applyNo | noNull }}
                    </template>
                </el-table-column>
                <el-table-column label="贷款账号" width="200">
                    <template slot-scope="scope">
                        {{ scope.row.loanAccount | noNull }}
                    </template>
                </el-table-column>
                <el-table-column label="案件编号" width="220">
                    <template slot-scope="scope">
                        {{ scope.row.caseNo | noNull }}
                    </template>
                </el-table-column>
                <el-table-column prop="overdueDay" :render-header="dHeader" width="150" sortable>
                    <template slot-scope="scope">
                        {{scope.row.overdueDay?`${scope.row.overdueDay}天`: '--'}}
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
                <el-table-column label="渠道号" width="200">
                    <template slot-scope="scope">
                        {{ scope.row.channelNo | noNull }}
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column label="客户信息" width="auto">
                <el-table-column  prop="customerNo" label="客户编号" width="150" fixed></el-table-column>
                <el-table-column  prop="customerName" label="客户姓名" width="auto"> </el-table-column>
                <el-table-column prop="customerIdNumber" label="身份证号" width="220"></el-table-column>
                <el-table-column prop="customerMobile" label="手机号码" width="150"></el-table-column>
            </el-table-column>
        </el-table>
        </div>
        
 
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
import validator from '@/utils/rules';
import { shortcuts,pUploadUrl,pdownLoadUrl,pbatchDownloadUrl } from '@/utils/constant';
import { downLoadFile,deepCopy,formatDate } from '@/utils/index';
import TipsDialog from '@/components/Dialog/tipsDialog';
import Select from '@/components/Select/Select';
import PurposeDialog from '@/components/Dialog/purposeDialog';
import { protocolList } from '@/api/quickSearch';
import { pFileCheck } from '@/api/protocolMng';
import Pagination from '@/components/Pagination/index';
import Mixin from '@/views/mixins/mixin';
import pagiMix from '@/views/mixins/pagiMix';
import batchDownLoadFile from '@/views/mixins/batchDownLoadFile';
import { Message } from "element-ui";
import { mapState } from 'vuex'
import { getZeroTime,getEndTime } from '@/utils/index'
export default {
    name:'quickSearch',
    mixins:[Mixin,pagiMix,batchDownLoadFile],
    components:{
        TipsDialog,
        Pagination,
        PurposeDialog,
        Select,
    },
    data(){
        return {
            clearable:false,
            isclearable:true,
            queryParam:{
                customerName:'',
                customerIdNumber:'',
                customerMobile:'',
                customerNo:'',
                protocolTypes:[],
                protocolName:'',
                caseNo:'',
                loanAccount:'',
                applyNo:'',
                channelNo:'',
                productName:'',
                productNo:'',
                overdueDayMin:'',
                overdueDayMax:'',
                signStartTime:'',
                signEndTime:'',
                dataOptions: []
            },
            queryCount:0,//点击查询按钮次数
            uploadUrl:pUploadUrl,
            file: {
                receiversFile: []
            },
            rules:{
                "customerIdNumber":[
                    { validator:validator.isCardId,trigger:['blur','change']}
                ],
                "customerMobile":[
                    { validator:validator.isPhone,trigger:['blur','change'] }
                ],
                "applyNo":[
                    { validator:validator.isApplyNo,trigger:['blur','change'] }
                ],
                "overdueDayMin":[
                    { validator:(rules,value,callback)=> {
                        let { overdueDayMax } = this.queryParam;
                        let reg = /^[\d]+$/;
                        let intValue = parseInt(value);
                        let intOverdueDayMax =  parseInt(overdueDayMax)
                        if( (value && !reg.test(value)) || (overdueDayMax && !reg.test(overdueDayMax))){
                            return callback(new Error('逾期天数仅支持输入数字'))
                        }
                        if(value && intValue > intOverdueDayMax){
                            return callback(new Error('最小逾期天数不得大于最大逾期天数'))
                        }
                        return callback()
                    }, trigger:['blur','change']}
                ],
                "dataOptions":[
                    { required:true, validator:(rules,value,callback)=> {
                        if(!value || !value[0] || !value[1]){
                            return callback(new Error('请选择签署开始时间和结束时间'))
                        }
                        if(value[0] > value[1]){
                            return callback(new Error('结束时间不可早于开始时间'))
                        }
                        return callback()
                    }, trigger:['blur','change']}
                ],
            },
            datePickerOptions:{
                shortcuts: shortcuts,
                // disabledDate:time => {
                //     let endDate = new Date(this.queryParam.signEndTime);
                //     if(endDate){
                //         return (time.getTime() > endDate.getTime());
                //     }
                // },
            },
            tabelData:[],
        }
    },
    computed:{
        ...mapState({
            permission_btns: state => state.permission.btns
        }),
        channelNoList(){
            let origData = this.$store.state.common.channelNoList
            let data = [{channelNo:'查询全部',channelName:'查询全部'}].concat(origData)
            return data;
        },
        options(){
            let oriOpt = this.$store.state.common.protocolTypeList;
            let options = oriOpt.map(item => {
                let op ={
                    id:item.tagCode,
                    name:item.tagName,
                    state:false,
                }
                return op;
            })
            return  [{ id:'all',name:'查询全部',state:false}].concat(options)
        }
    },
    mounted(){
        this.getPickerList()
        this.init();
        this.query();
    },
    methods:{
        getPickerList(){
            this.$store.dispatch('getChannelList');
            this.$store.dispatch('getProtocolTypeList');
        },
        renderHeader(h, { column, $index }) {
            return h('div', {attrs: {  style: 'position:relative;' }}, [
                 h('span', {}, '操作'),
                 h('div', { attrs: {  style: 'display:inline-block;' }}, [
                    h('span', { attrs: {  style: 'width: 0px;height: 0px;border-width: 5px 5px;border-color: transparent transparent rgba(59, 182, 69, 0.68);border-style: solid;display: inline-block;',class:'triangle', }}, ''),
                    h('span', { attrs: {  style: 'width: 0px;height: 0px;border-width: 5px 5px;border-color: rgba(59, 182, 69, 0.68) transparent transparent;border-style: solid;display: inline-block;',class:'triangle', }}, ''),
                   ])
                ]
            )
        },
        init(){
            this.queryParam.signStartTime = getZeroTime(new Date().getTime() - 3600 * 1000 * 24 * 6);
            this.queryParam.signEndTime = getEndTime(new Date().getTime());
            this.queryParam.dataOptions = [this.queryParam.signStartTime, this.queryParam.signEndTime]
            this.queryParam.protocolTypes = ['all']
            // console.log('protocolTypes',this.queryParam.protocolTypes)
            this.queryParam.channelNo = '';
        },
        downLoadExample(){
            downLoadFile(pdownLoadUrl);
        },
        getTagCode(){
            let oL = this.$store.state.common.protocolTypeList;
            let codeArr = []
            oL.forEach(i=> {
                codeArr.push(i.tagCode)
            });
            return codeArr;
        },
        getPar(list,pageNum){
            if(pageNum){
                this.paginationParam.pageNum  = pageNum;
            }
            let queryParam = deepCopy(this.queryParam);
            queryParam.signEndTime = formatDate(this.queryParam.signEndTime)
            queryParam.signStartTime = formatDate(this.queryParam.signStartTime)
            let {overdueDayMin,overdueDayMax} = queryParam;
            queryParam.overdueDayMin = overdueDayMin?overdueDayMin:'';
            queryParam.overdueDayMax = overdueDayMax?overdueDayMax:'';
            let protocolTypes = deepCopy(this.queryParam.protocolTypes);
            delete queryParam.protocolTypes;

            const pLen = protocolTypes.length;
            console.log('pLen',pLen)
            let allIdx = protocolTypes.indexOf('all')
            let typeStr;
            if(pLen > 1 && allIdx > -1){
                protocolTypes.splice(allIdx,1)
                typeStr = protocolTypes.join(',');
                
            } else if(pLen == 1 && allIdx > -1){
               let arr = this.getTagCode();
               typeStr = arr.join(',');
            } else {
                typeStr = protocolTypes.join(',');
            }
            queryParam.protocolTypes = typeStr;

            if(queryParam.channelNo == '' || queryParam.channelNo == '查询全部'){
                delete queryParam.channelNo
            }
            let params ={
                pageNum:this.paginationParam.pageNum,
                pageSize:this.paginationParam.pageSize,
                list:list || [{ ...queryParam }],
                uploadReq:list?true:false,
            }
            console.log('list',params)
            return params;
        },
        query(list,pageNum){
            if(list){
                this.getAjax(list,pageNum);
            } else {
                this.validateData();
            }
        },
        async getAjax(list,pageNum){
            try {
                let params = this.getPar(list,pageNum)
                let res = await protocolList(params)
                this.tabelData = res.resData.list;
                this.tabelData.forEach((item,index) => {
                    item.hadView = false;
                    item.index = (index + 1);
                })
                this.paginationParam.total = res.resData.total;
                this.queryCount +=1;
                localStorage.setItem('wbQC',this.queryCount);
            } catch (error) {
                console.log('error',error)
                this.rollBack();
            }
        },
        reset(){
            for(let key in this.queryParam){
                this.queryParam[key] = '';
            }
            this.init();
        },
        confirmPurpose(purpose){
            this.tipsDialog.showCancel = true;
            this.tipsDialog.cancelTxt = '查看详情';
            let contractList = this.getProtocolList()
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
        downFile(data){
            let blob = new Blob([data], {type: 'application/zip'})
            let url = window.URL.createObjectURL(blob)
            const link = document.createElement('a') // 创建a标签
            link.href = url
            // link.download = '' // 重命名文件
            link.click()
            URL.revokeObjectURL(url) // 释放内存
        },
        goto(){
            //跳转到我的工作台
            this.$router.push({
                name:'workbench'
            })
        },
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
            console.log('go in gotoDetail')
            if(index !== undefined){
                this.tabelData[index].hadView = true;
            }
            let los = 'pmProID';
            localStorage.removeItem(los)
            localStorage.setItem(los,JSON.stringify(this.getIDs()));
            let account = this.$store.state.user.username;
            console.log('account',account)
            var { href } = this.$router.resolve({
                path: '/fileDetail',
                query: {
                    docid: id,
                    queryCount:this.queryCount,
                    type:'protocol',
                    store:los,
                    cname:'wbQC',
                    account:account,
                    permission_btns: this.permission_btns,
                    downLoadPermission: 'downloadProtocol',
                    detailPermission: 'protocolDetail'
                }
            });
            console.log('href',href)
            let sonWin = window.open(href, '_blank');
            console.log('sonWin',sonWin)
        },
        eHeader(h, { column, $index },index){
           return h('span', {}, [
            h('span', {}, '协议信息'),
            h('el-tooltip',
                { props:{style:'position:absolute;right:0;',class:'item',effect:'dark',placement:'top'}},
                [
                    h('div',{ slot:'content',class:'bg78' },[
                        h('p',{},'协议可查范围:'),
                        h('p',{},'1、自营渠道协议数据实时同步，延迟10分钟左右'),
                        h('p',{},'2、第三方渠道协议数据同步至T-2日'),
                    ]),
                    h('i',{ class:'el-icon-question'})
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
        handleImport(){
            document.getElementById('importFiles').value = null;
            document.getElementById('importFiles').click();
        },
    },
    watch: {
        'queryParam.dataOptions': {
            handler: function(value) {
                if (!value) {
                    this.queryParam.signStartTime = '';
                    this.queryParam.signEndTime = '';
                } else {
                    this.queryParam.signStartTime = value[0] || '';
                    this.queryParam.signEndTime = value[1] || ''
                }
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.table-container{
    padding-bottom: 20px;
}
.contractTable{
    margin-left: 20px;
    margin-right: 20px;
}
.form-input-inline{
    display: inline-block;
}
.el-table th div.triangle{
    width: 0px;
    height: 0px;
    border-width: 10px 6.3px;
    border-color: transparent transparent rgba(59, 182, 69, 0.68);
    border-style: solid;
    display: inline-block;
}
.hadView{
    color:#ccc;
}
</style>
<style>
/*表格全选框去除空框*/
.cell.hideSelection  .el-checkbox {
  display: none!important;
  position: relative;
}
/*表格全选框改为：选择*/
.cell.hideSelection:after {
  content: "\9009\62e9";
}
.active .el-select-dropdown.is-multiple .el-select-dropdown__item.selected::after{
    content:''!important;
}
</style>