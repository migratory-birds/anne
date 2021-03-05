<template>
<div class="panel ct-l">
    <!-- 合同列表 -->
    <div class="customer">
        <div>客户编号：{{userNo}}</div>
        <div>客户姓名：{{userName}}</div>
    </div>
    <el-tabs type="border-card" v-model="activeName">
        <el-tab-pane label="协议列表" name="protocol">
            <Protocol></Protocol>
        </el-tab-pane>
        <el-tab-pane label="存证列表" name="certification">
            <Certification></Certification>
        </el-tab-pane>
    </el-tabs>

</div>
</template>
<script>
import Protocol from './protocol';
import Certification from './certification';
import bus from '@/utils/bus';
export default {
    name:'contractList',
    components:{
        Protocol,
        Certification
    },
    data(){
        return {
            activeName:'protocol',
        }
    },
    computed:{
        userNo(){
            return this.$route.params.userNo;
        },
        userName(){
            return this.$route.params.userName;
        },
    },
    activated(){
        bus.$on('activeName',val => {
            this.activeName = val;
        })
    },
    methods:{

    },
}
</script>
<style lang="scss" scoped>
.customer{
    font-size: 16px;
    padding-left: 25px;
    padding-top: 23px;
    padding-bottom: 22px;
}
.ct-l{
    height: 90%;
}
</style>