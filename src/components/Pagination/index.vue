<template>
    <div :class="{'hidden':hidden}" class="pagination-container pagination" :style="{ 'background-color':bgColor,'text-align':`${setAlign}`}">
        <el-pagination
                :background="background"
                :current-page.sync="currentPage"
                :page-size.sync="pageSize"
                :layout="layout"
                :page-sizes="pageSizes"
                :total="total"
                v-bind="$attrs"
                :page-count="total_page"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange">
        </el-pagination>
    </div>
</template>

<script>
// import {scrollTo} from '@/utils/scroll-to';
export default {
    name:'pagination',
    props:{
        hidden:{
            type:Boolean,
            default:false
        },
        //总条目
        total:{
            type:Number,
            default:0
        },
        //总页数
        total_page:{
            type:Number,
            default:1
        },
        //当前页
        page:{
            type:Number,
            default:1
        },
        limit:{
            type:Number,
            default:10
        },
        //分页选择数组
        pageSizes:{
            type:Array,
            default:[5,10]
        },
        //组件布局
        layout:{
            type:String,
            default:'total, sizes,prev, pager, next, jumper'
        },
        //是否为分页按钮添加背景色
        background:{
            type:Boolean,
            default:false
        },
        bgColor:{
            type:String,
            default:'#fff'
        },
        setAlign:{
            type:String,
            defalut:'right'
        }
    },
    data(){
        return {

        }
    },
    computed:{
        currentPage:{
            get(){
                return this.page;
            },
            set(val){
                this.$emit('update:page', val);
            }
        },
        pageSize:{
            get(){
                return this.limit;
            },
            set(val){
                this.$emit('update:limit', val);
            }
        },
    },
    methods:{
        //每页显示条目个数 改变
        handleSizeChange(val){
            console.log('每页显示条目个数===============')
            this.$emit('pagination', {page: this.currentPage, limit: val,type:'size'});
            // if (this.autoScroll) {
            //     scrollTo(0, 800);
            // }
        },
        //当前页改变
        handleCurrentChange(val){
            console.log('当前页改变')
            this.$emit('pagination', {page: val, limit: this.pageSize,type:'current'});
            // if (this.autoScroll) {
            //     scrollTo(0, 800);
            // } 
        }
    },

}
</script>

<style scoped>
.pagination-container.hidden {
    display: none;
}
</style>
<style>
.el-pager, .el-pager li{
    line-height:28px;
}
</style>
