<template> 
  <div class="bar">
    <div class="left">
      <div class="logo-c">
        <div class="systemLogo"></div>
      </div>
      <div class="title">电子协议管理系统</div>
    </div>
    <div class="right">
      <img class="icon" src="../../../assets/user.png"/>
      <div class="user name">{{username}}</div>
      <div class="logout" @click="logout">
        <img class="icon" src="../../../assets/logout.png" />
        <span class="user">退出登录</span> 
      </div>
    </div>
</div>
</template>

<script>
import variables from '@/styles/variables.scss';
import { exit, findUserName } from '@/api/login'

export default {
  name:'Navbar',
  data(){
    return {
      username: ''
    }
  },
  computed:{
    variables(){
      return variables;
    }
  },
  mounted() {
    findUserName().then(res => {
      if (res) {
        this.$store.commit('getUserName',res.resData);
        this.username = this.$store.state.user.username;
      }
    }).catch(error => {
      console.log(error)
    })
  },
  methods:{
    handleSelect(val){
      this.$store.dispatch('setTopBarName',val)
    },
    logout() {
      exit().then(res => {
        if (res) {
          window.location.replace(res.resData)
        }
      }).catch(error => {
        console.log(error)
      })
    },
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '@/styles/variables.scss';
$selected:rgb(64, 158, 255);
.bar{
  width: 100%;
  height: $barHeight;
  position: relative;
  background:$barBgColor;
  display: flex;
  color:$barColor;
  align-items: center;
  .left,.right, .logout{
    display: flex; 
    flex-direction: row;
    align-items: center;
  }
  .right {
    position: absolute;
    right:34px;
    font-size: 16px;
    height: 20px;
    line-height: 20px;
  }
  .icon {
    margin-right: 8px;
  }
  .info{
    font-size: 16px;
    font-family:MicrosoftYaHei;
    margin: 0;
    color:#ccc;
    cursor: pointer;
    transition: border-color .3s,background-color .3s,color .3s;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .user{
    margin: 0;
    height: 28px;
    line-height: 28px;
    display: inline-block;
    position: relative;
  }
  .name {
    margin-right: 10px;
  }
}
.logo-c{
  width: $sideBarWidth;
  height: 48px;
  margin: 0 auto;
  border-right: .9px solid #fff;
}
.systemLogo {
  width:146px;
  height:38px;
  line-height:38px;
  margin: 0 auto;
  background-image: url(../../../assets/logo.png);
  background-size: 100% auto;
  background-repeat: no-repeat;
}
.title {
  font-size:19px;
  font-family:MicrosoftYaHei;
  font-weight:bold;
  color:#fff;
  line-height:38px;
  padding-left: 32px;
}
.logout {
  cursor: pointer;
}
</style>