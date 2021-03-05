<template>
    <section class="maincontain">
         <Breadcrumb></Breadcrumb>
        <keep-alive>
            <router-view v-if="$route.meta.keepAlive" :key="key"></router-view>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"></router-view>
    </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb/index.vue';
export default {
    name:'AppMain',
    components:{
        Breadcrumb,
    },
    computed:{
        key(){
            return this.$route.fullPath;
        },
        keepAlive(){
            if(this.$route.meta.keepAlive){
                return this.$route.meta.keepAlive;
            }
            return false;
        }
    },
}
</script>

<style lang="scss" scoped>
    .app-main {
        /* 50= navbar  50  */
        min-height: calc(100vh - 50px);
        /*180 = sidebar*/
        min-width: calc(100vh - 180px);
        position: relative;
        overflow: hidden;
        background-color: #eee;
    }

    .fixed-header+.app-main {
        padding-top: 50px;
    }
</style>

<style lang="scss">
    // fix css style bug in open el-dialog
    .el-popup-parent--hidden {
        .fixed-header {
            padding-right: 15px;
        }
    }
</style>

