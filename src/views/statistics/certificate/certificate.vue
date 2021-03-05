<script>
import protocolMix from '../protocol/protocol';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
require('echarts/lib/component/legendScroll')
import { contractStatis } from '@/api/statistics';

export default {
    name:'certificate',
    mixins:[protocolMix],
    data(){
        return {
            queryParam:{
                operationType:'2',
                operationDate:[],
                operationName:'',
                operationSection:'',
                operationRole:'',
                operationModel:[],
                dateOption:'',
                groupByOperator:false,
            },
            type:'certificate',
            buttonPermission: 'contractDataStatisticList'
        }
    },
    methods:{
        
    }
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
.charts{
    width: 1440px;
    height: 350px;
    line-height: 350px;
    padding: 20px 0;
    text-align: center;
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
.tooltip-container{
    min-width:227px;
}
.chart-tips{
    text-align: left;
    padding: 5px;
    padding-left: 20px;
    font-size: 14px;
    line-height: 40px;
    color:rgba(161, 169, 184, 1);
    border-bottom: 1px solid #353F51; 
}
.number{
    color:rgba(161, 169, 184, 1);  
}
.tooltip-number{
    text-align: left;
    padding-top: 15px;
    padding-left: 20px;
}
.check-number{
    padding-bottom: 15px;
}
.form .el-date-editor .el-range-separator{
    width: 9%;
}
</style>