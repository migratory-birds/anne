<template>
    <div>
      <div class="tab-wrap">
        <span @click="handleTab('A')" class="tab-item" :class="{'active': activeTab === 'A'}">下载/查看日志</span>
        <span class="tab-gap"></span>
        <span @click="handleTab('B')" class="tab-item" :class="{'active': activeTab === 'B'}">查询操作日志</span>
      </div>
      <DownloadLog v-show="activeTab === 'A'"></DownloadLog>
      <SearchLog v-show="activeTab === 'B'"></SearchLog>
    </div>
</template>
<script>
import DownloadLog from './downloadLog'
import SearchLog from './searchLog'
import { getDeptList, getRoleList } from '@/api/statistics';
export default {
    name: 'log',
    components: {
      DownloadLog,
      SearchLog
    },
    data(){
        return {
          activeTab: 'A',
        }
    },
    beforeRouteEnter(to,from,next){
      next(vm => {
        if(from.name == 'protocol'){
          let pa = vm.$route.params;
          if (pa.tab) {
            vm.activeTab = pa.tab;
          }
        }
      })
        
    },
    mounted() {
      this.initOptions();
    },
    methods: {
      handleTab(activeTab) {
        this.activeTab = activeTab
      },
      async initOptions() {
        try {
          // 获取操作部门和操作角色
          this.$store.dispatch('getDeptList')
          this.$store.dispatch('getRoleList')
        } catch (e) {
          console.log(e)
        }
      }
    }
}
</script>
<style lang="scss" scoped>
.tab-wrap {
  margin-left: 30px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.tab-item, .tab-gap {
  display: block;
  height: 22px;
  line-height: 22px;
  color: #1C88FD;
}
.tab-item {
  padding: 0 10px;
  border-radius: 11px;
  cursor: pointer;
  &.active {
    background: #1C88FD;
    color: #fff;
  }
}
.tab-gap {
  width: 2px;
  background:  #1C88FD;
  margin: 0 10px;
}
</style>