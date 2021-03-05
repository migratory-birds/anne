import { getZeroTime,getEndTime } from '@/utils/index'

export const shortcuts = [
  {
    text: '今天',
    onClick(picker) {
      const date = new Date();
      let timestamp = new Date().getTime();
      const start = getZeroTime(timestamp);
      const end = getEndTime(timestamp);
      picker.$emit('pick', [start,end]);
    }
  },
  {
    text: '昨天',
    onClick(picker) {
      const date = new Date();
      const timestamp = date.getTime() - 3600 * 1000 * 24;
      const start = getZeroTime(timestamp);
      const end = getEndTime(timestamp);
      picker.$emit('pick', [start,end]);
    }
  }, 
  {
      text: '最近7日',
      onClick(picker) {
        const date = new Date();
        const timestamp = date.getTime() - 3600 * 1000 * 24 * 6;
        const start = getZeroTime(timestamp);
        console.log('start time',start)
        const end = getEndTime(date.getTime());
        picker.$emit('pick', [start,end]);
      }
  },
  {
      text: '最近30日',
      onClick(picker) {
        const date = new Date();
        const timestamp = date.getTime() - 3600 * 1000 * 24 * 29;
        const start = getZeroTime(timestamp);
        const end = getEndTime(date.getTime());
        picker.$emit('pick', [start,end]);
      }
  },
  {
      text: '最近90日',
      onClick(picker) {
        const date = new Date();
        const timestamp = date.getTime() - 3600 * 1000 * 24 * 89;
        // debugger
        const start = getZeroTime(timestamp);
        const end = getEndTime(date.getTime());
        picker.$emit('pick', [start,end]);
      }
  },
];
export const shortcutsRange = [
  {
    text: '今日',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime());
      picker.$emit('pick', [start, end]);
    }
  },
  {
    text: '昨日',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
      end.setTime(end.getTime() - 3600 * 1000 * 24 * 1);
      picker.$emit('pick', [start, end]);
    }
  },
  {
    text: '最近7日',
    onClick(picker) {
      const date = new Date();
      const timestamp = date.getTime() - 3600 * 1000 * 24 * 7;
      const start = getZeroTime(timestamp);
      console.log('start time',start)
      const end = getEndTime(date.getTime());
      picker.$emit('pick', [start,end]);
    }
  },
  {
    text: '最近30日',
    onClick(picker) {
      const date = new Date();
      const timestamp = date.getTime() - 3600 * 1000 * 24 * 30;
      const start = getZeroTime(timestamp);
      const end = getEndTime(date.getTime());
      picker.$emit('pick', [start,end]);
    }
  }, 
  {
    text: '最近90日',
    onClick(picker) {
      const date = new Date();
      const timestamp = date.getTime() - 3600 * 1000 * 24 * 90;
      const start = getZeroTime(timestamp);
      const end = getEndTime(date.getTime());
      picker.$emit('pick', [start,end]);
    }
},
]
export const odShortcuts = [
  {
    text: '今天',
    onClick(picker) {
      const date = new Date();
      let timestamp = new Date().getTime();
      const start = getZeroTime(timestamp);
      const end = getEndTime(timestamp);
      picker.$emit('pick', [start,end]);
    }
  },
  {
    text: '昨天',
    onClick(picker) {
      const date = new Date();
      const timestamp = date.getTime() - 3600 * 1000 * 24;
      const start = getZeroTime(timestamp);
      const end = getEndTime(timestamp);
      picker.$emit('pick', [start,end]);
    }
  }, 
  {
      text: '最近7日',
      onClick(picker) {
        const date = new Date();
        const timestamp = date.getTime() - 3600 * 1000 * 24 * 6;
        const start = getZeroTime(timestamp);
        console.log('start time',start)
        const end = getEndTime(date.getTime());
        picker.$emit('pick', [start,end]);
      }
  },
  {
    text: '最近20日',
    onClick(picker) {
      const date = new Date();
      const timestamp = date.getTime() - 3600 * 1000 * 24 * 19;
      const start = getZeroTime(timestamp);
      const end = getEndTime(date.getTime());
      picker.$emit('pick', [start, end]);
    }
  }, 
]
export const StatusMap = [
  {id:'0',name:'未签署'},
  {id:'2',name:'已签署'},
  {id:'3',name:'签署中'},
  {id:'4',name:'系统中止签署'},
  {id:'5',name:'用户拒绝签署'},
]
export const qUploadUrl = process.env.VUE_APP_BASE_URL + '/quickIndex/file/uploadExcel'
export const pUploadUrl = process.env.VUE_APP_BASE_URL + '/protocol/file/upload'
export const cUploadUrl = process.env.VUE_APP_BASE_URL + '/contract/file/uploadExcel'

export const qdownLoadUrl = process.env.VUE_APP_BASE_URL + '/common/template/quick'
export const pdownLoadUrl = process.env.VUE_APP_BASE_URL + '/common/template/protocol'
export const cdownLoadUrl = process.env.VUE_APP_BASE_URL + '/common/template/contract'

export const qdownLoadFile = process.env.VUE_APP_BASE_URL + '/quickIndex/file/uploadExcel'
export const cdownLoadFile = process.env.VUE_APP_BASE_URL + '/contract/file/download'
export const pdownLoadFile = process.env.VUE_APP_BASE_URL + '/protocol/file/download'
export const cbatchDownloadUrl = process.env.VUE_APP_BASE_URL + '/contract/file/batch/download'
export const pbatchDownloadUrl = process.env.VUE_APP_BASE_URL + '/protocol/file/batch/download'
export const qbatchDownloadUrl = process.env.VUE_APP_BASE_URL + '/quickIndex/file/batch/download'


export const typeList = [
  {id:'3',name:'存证/协议'},
  {id:'2',name:'仅看存证'},
  {id:'1',name:'仅看协议'},
]
//下载状态
export const statusList = [
  {id:'DSE02',name:'下载成功'},
  {id:'DSE03',name:'下载失败'},
  {id:'DSE01',name:'下载中'},
] 
//下载对象
export const objList = [
  {id:'2',name:'存证'},
  {id:'1',name:'协议'},
]
//存证状态
export const contractStatusList = [
  { id:'0',name:'未签署' },
  { id:'2',name:'已签署' },
]

// 操作方式
export const operationModeList = [
  {id:'', name:'下载/查看', handleType: '下载/查看'},
  {id:'1', name:'下载', handleType: '仅看下载'},
  {id:'2', name:'查看', handleType: '仅看查看'}
]

// 操作对象
export const logObjList = [
  {id:'',name:'存证/协议', handleType: '存证/协议'},
  {id:'1',name:'协议', handleType: '仅看协议'},
  {id:'2',name:'存证', handleType: '仅看存证'},
]

// 操作内容
export const logContentList = [
  {id:'',name:'全部', handleType: '全部'},
  {id:'1',name:'查询协议', handleType: '查询协议'},
  {id:'2',name:'查询存证', handleType: '查询存证'},
  {id:'3',name:'快速搜索', handleType: '快速搜索'}
]
