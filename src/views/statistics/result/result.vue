<template>
<div>
    <!-- <div>协议数据统计</div> -->
    <div @keyup.enter="query()">
    <div class="panel">
        <div class="panel-title"><span class="panel-title-b"></span><span class="panel-title-t">统计条件</span></div>
        <el-form ref="form" :model="queryParam" :rules="rules" :inline="true" label-width="100px">
            <el-form-item label="统计时间" prop="customerName">
                <el-date-picker v-model="queryParam.operationDate" type="daterange" range-separator="至" :picker-options="pickerRange" start-placeholder="开始月份" end-placeholder="结束月份"></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" plain @click="reset" round>重置</el-button>
              <el-button type="primary" @click="query" round>查询</el-button>
          </el-form-item>
        </el-form>
        
           
    </div>
        <div class="panel">
            <div class="panel-operation-container barRela">
                <span class="panel-title-b"></span><span class="marl17">统计结果（实时）<el-tooltip class="item" effect="dark" placement="top">
                <div slot="content">
                  <p>统计一段时间内在本系统下载或查看协议文件的数量分布</p>
                  <p>（每次下载/查看一份存证计1次）</p>
                </div>
                <i class="el-icon-question table-msg" />
                </el-tooltip></span>
                <div class="panel-title-r switch-container">
                    <div class="group-container">
                        <div class="group" @click="changeGroup(1)" :class="{ 'isActive':queryParam.dateOption == 1,'unActive':queryParam.dateOption !== 1}">按年</div>
                        <div class="group" @click="changeGroup(2)" :class="{ 'isActive':queryParam.dateOption == 2,'unActive':queryParam.dateOption !== 2}">按月</div>
                        <div class="group" @click="changeGroup(3)" :class="{ 'isActive':queryParam.dateOption == 3,'unActive':queryParam.dateOption !== 3}">按日</div>
                    </div>
                </div>
            </div>
            <div class="charts-container">
              <div ref="numCharts" class="charts"></div>
              <div ref="rateCharts" class="charts"></div>
            </div>
            <div class="table-container" :style="{ width:`${ tbcWidth +1 }px`,'max-width':`1500px`}">
                <el-table :data="tData" border :style="{ width:`${ tbcWidth + 1}px`}">
                    <el-table-column v-for="(item,index) in columnObj" :key="index" :prop="item.code" :label="item.label" align="center" width="100" :fixed="index ==0 ? true:false">
                        <template slot-scope="scope">
                            <a v-if="index !==0" class="list-ctrl" @click="goTo(item.code,'protocol',recordRow[index])">{{ scope.row[item.code] }}</a>
                            <span v-else>{{ scope.row[item.code] }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</div>
</template>
<script>
import { shortcutsRange } from '@/utils/constant';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
require('echarts/lib/component/legendScroll')
import { contractStatis } from '@/api/statistics';
import { formatDate } from '@/utils/index';
export default {
    name:'protocol',
    data(){
        return {
            queryParam:{
                operationDate:[],
                dateOption:'',
            },
            pickerRange:{
                shortcuts: shortcutsRange,
                 disabledDate:time => {
                    let endDate = this.queryParam.endTime;
                    if(endDate){
                        return (time.getTime() > endDate.getTime());
                    }
                },
            },
            xAxisArr:[],
            downNumArr:[],
            checkNumArr:[],
            yData:[],
            checkNumSerie:{},
            columnObj: [
              { label:'指标项', code:'rowLabel' },
              { label:'合计值', code:'sum' },
              { label: '2021-01-01(周二)', code:'num' },
              { label: '2021-01-02(周三)', code:'num' },
              { label: '2021-01-03(周四)', code:'num' },
              { label: '2021-01-04(周五)', code:'num' },
              { label: '2021-01-05(周六)', code:'num' },
              { label: '2021-01-06(周日)', code:'num' }
            ],
            tData: [
              {
                rowLabel: '存证成功数量',
                sum: 10000,
                num: 100
              },
              {
                rowLabel: '存证成功率',
                sum: '99%',
                num: '99%'
              }
            ],
            recordRow: {}
        }
    },
     computed:{
        tbcWidth(){
            let len = this.columnObj.length * 100
            console.log('len',len)
            return len;
        }
    },
    mounted(){
        this.init();
        this.initCharts(); 
        // this.query();
    },
    methods:{
        init(){
            this.$set(this.queryParam.operationDate,0,new Date().getTime() - 3600 * 1000 * 24 * 7);
            this.$set(this.queryParam.operationDate,1,new Date().getTime());
            this.queryParam.dateOption = 3;
        },
        query(){
            let par = { ...this.queryParam };
            par.operationDateStart = formatDate(this.queryParam.operationDate[0]);
            par.operationDateEnd = formatDate(this.queryParam.operationDate[1]);
            console.log('par',par)
            contractStatis(par).then(res => {
                console.log('res',res)
                let dt = res.data.resData;
                const list = dt.contractOperationList;
                let self = this;
                //清空历史数据，以免数据重新渲染
                this.xAxisArr = [];
                this.yData = [];
                this.tData = [];
                //表数据处理
                this.columnObj = [
                    { label:'指标项', code:'rowLabel' },
                    { label:'合计值', code:'sum' },
                ]
                // this.recordRow = {};
                list.forEach(item => {
                    self.xAxisArr.push(item.operationDate);
                    self.columnObj.push({ label: item.operationDate, code: item.operationDate });
                    self.downNumArr.push(item.downNum);
                    self.checkNumArr.push(item.checkNum);
                    //表数据处理
                    let oDate = item.operationDate;
                    if(this.recordRow['下载数量']){
                        this.recordRow['下载数量'][oDate] = item.downNum;
                    }else{
                        this.recordRow['下载数量'] ={}
                        this.recordRow['下载数量']['rowLabel'] = '下载数量';
                        this.recordRow['下载数量']['sum'] = dt.downTotalNum;
                        this.recordRow['下载数量'][oDate] = item.downNum;
                    }
                    if(this.recordRow['查看数量']){
                        this.recordRow['查看数量'][oDate] = item.checkNum;
                    }else{
                        this.recordRow['查看数量'] ={}
                        this.recordRow['查看数量']['rowLabel'] = '查看数量';
                        this.recordRow['查看数量']['sum'] = dt.checkTotalNum;
                        this.recordRow['查看数量'][oDate] = item.checkNum;
                    }
                });
                console.log('this.recordRow',this.recordRow,'obj:',this.columnObj)
                Object.keys(this.recordRow).map(item => {
                    this.tData.push(self.recordRow[item])
                })
                this.initCharts(); 
            }); 
        },
        plainP(list){
             for(let key in list){
                let qKey = list[key];
                let type = Object.prototype.toString.call(qKey);
                if(type === "[object Array]"){
                    list[key] = [];
                } else if ( type === "[object Object]"){
                    this.plainP(qKey);
                } else if (type=== "[object Boolean]"){
                    list[key] = false;
                } else {
                    list[key] = '';
                }
            }
        },
        reset(){
            this.plainP(this.queryParam);
            this.init();
        },
        changeGroup(val){
            this.queryParam.dateOption = val;
            this.query()
        },
        initCharts(){
            let colorArr =['#1E90FF','#EFB14E'];
            const numCharts = echarts.init(this.$refs.numCharts);
            const rateCharts = echarts.init(this.$refs.rateCharts)
            let self = this;
            const tooltip = {
              trigger: 'axis',
              backgroundColor: '#242C3B',
            }
            const xAxis = {
              type: 'category',
              data: ['21.01.01', '21.01.02', '21.01.03', '21.01.04', '21.01.05', '21.01.06'],
            };
            const numChartOptions ={
                title: {
                    text: '存证成功数量',
                    textStyle: {
                      color: '#1E90FF',
                      fontWeight: 'normal',
                      fontSize: 16
                    },
                    textAlign: 'left'
                },
                tooltip: tooltip,
                // tooltip:{
                //     trigger: 'axis',
                //     backgroundColor: '#242C3B',
                //     formatter: (obj) => {
                //         // console.log('obj',obj[0],obj[1])
                //         let str = `<div class="chart-tips">${obj[0].axisValue}`;
                //         let Len = obj[0].axisValue.split('-');
                //         if(Len == 3){
                //             let day =new Date(obj[0].axisValue).getDay();
                //             var arr = ['日','一','二','三','四','五','六',]
                //             let days = arr[day];
                //             let weekday = ` (周${days})`;
                //             str += weekday+'</div>';
                //         }
                //         let dialogData ={
                //             down:{
                //                 isShow:false,
                //                 idx:0,
                //             },
                //             check:{
                //                 isShow:false,
                //                 idx:0,
                //             },
                //         }
                //         let showdown = false;
                //         let showcheck = false;
                //         obj.forEach((item,index,arr) => {
                //             // console.log('ite,',item,item.seriesName)
                //             if(item.seriesName == '下载数量'){
                //                 // console.log('do')
                //                 dialogData.down.isShow = true;
                //                 dialogData.down.idx = index;
                //             }
                //             if(item.seriesName == '查看数量'){
                //                 // console.log('ch')
                //                 dialogData.check.isShow = true;
                //                 dialogData.check.idx = index;
                //             }
                //         })
                //         // console.log('di',dialogData)
                //         if(dialogData.down.isShow){
                //             str+=`<p>下载数量：${obj[dialogData.down.idx].value}次</p>`
                //         }
                //         if(dialogData.check.isShow){
                //             str += `<p>查看数量：${obj[dialogData.check.idx].value}次</p>`;
                //         }
                //         return str;
                //     }
                // },
                legend:{
                    data: ['存证成功数量'],
                    // origent: 'vertical',
                    // x: 'center',
                    y: 'bottom',
                },
                xAxis: xAxis,
                yAxis:{
                    type: 'value',
                    axisTick:{
                        show: false
                    },
                    axisLine:{
                        show: false
                    }
                },
                series: [
                  {
                    type: 'line',
                    data: [10, 20, 30, 40, 50, 60],
                    name: '存证成功数量',
                    itemStyle:{
                        color: '#1E90FF'
                    }
                  }
                ]
            };
            const rateChartOptions ={
                title: {
                    text: '存证成功率',
                    textStyle: {
                      color: '#1E90FF',
                      fontWeight: 'normal',
                      fontSize: 16
                    },
                    textAlign: 'left'
                },
                tooltip: tooltip,
                legend:{
                    data: ['存证成功率'],
                    y: 'bottom',
                },
                xAxis: xAxis,
                yAxis:{
                    type: 'value',
                    data: ['10%', '20%', '30%', '40%', '50%', '60%'],
                    axisTick:{
                        show: false
                    },
                    axisLine:{
                        show: false
                    }
                },
                series: [
                  {
                    type: 'line',
                    data: [10, 20, 30, 40, 50, 60],
                    name: '存证成功率',
                    itemStyle:{
                        color: '#1E90FF'
                    }
                  }
                ]
            };
            numCharts.setOption(numChartOptions, true)
            rateCharts.setOption(rateChartOptions, true)
        },
        goTo(date,protocolType,numType){
            console.log('099')
            console.log(date,protocolType,numType)
        }
    },
}
</script>
<style lang="scss" scoped>
.proto-q{
    text-align: left;
    padding-left: 1190px;
    padding-bottom: 24px;
}
.barRela{
    position: relative;
    border-bottom: 1px solid #FFF0F4FF;
}
.marl17{
    margin-left: 17px;
    font-size: 16px;
}
.panel-title-r{
    position: absolute;
    right: 34px;
    top:0;
}
.switch-container{
    color: #424B5D;
    font-size: 14px;
    .seenum{
        margin-right: 24px;
    }
    .switch{
        margin-right: 10px;
        margin-top: -5px;
    }
}
.group-container{
    display: inline-block;
    margin-left: 14px;
    .group{
        display: inline-block;
        width: 57.2px;
        height: 23.3px;
        line-height: 23.3px;
        text-align: center;
        border:1px solid #2986FD;
        font-size: 14px;
        cursor:pointer;
    }
    .group:nth-child(1){
        border-right: 0!important;
    }
    .group:nth-child(3){
        border-left: 0;
    }
    .isActive{
        background-color: #2986FD;
        color: #fff;
    }
    .unActive{
        background-color: #fff;
        color:#2986FD ;
    }
}
.charts-container {
  display: flex;
}
.charts{
    width: 50%;
    height: 350px;
    padding: 20px 0;
}
.table-container{
    // width:80%;
    margin-left: 90px;
    margin-right: 20px;
    padding-bottom: 60px;
}
</style>
<style>
.check-group{
    display:inline-block;
}
.chart-tips{
    padding: 0;
    font-size: 14px;
    line-height: 40px;
    /* border-bottom: 1px solid #353F51; */
}
</style>