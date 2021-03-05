import Mock from 'mockjs';
import searchApi from './search';
import statisticsApi from './statistics';

Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send
Mock.XHR.prototype.send = function(){
    if(this.custom.xhr){
        this.custom.xhr.withCredentials = this.withCredentials || false
    }
    this.proxy_send(...arguments)
}


Mock.mock(/quickIndex\/list/,'post',searchApi.getQuickIndex);
Mock.mock(/protocol\/list/,'post',searchApi.getprotocolList);
Mock.mock(/contract\/list/,'post',searchApi.getContractList);
Mock.mock(/satits\/contract\/data/,'post',statisticsApi.getChartData);

export default Mock;