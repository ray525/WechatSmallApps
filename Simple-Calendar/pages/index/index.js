import DataService from  '../../services/DataService';

// let t = DataService.findAll();
// console.log( t );

const LEVEL = {
  normal: 1,
  warning: 2,
  danger: 3
};

Page( {
  data: {
    showMonth: {},
    data: {},
    selectDateText: '',
    pickerDateValue: '',

    isSelectMode: false,
    isMaskShow: false,
    isEditMode: false,
    isSelectLevelASShow: false,

    // modal
    isModalShow: false,
    modalMsg: '',

    //事项等级数据
    levelSelectedValue: LEVEL.normal,
    levelSelectData: [ LEVEL.normal, LEVEL.warning, LEVEL.danger ],

    // updatePanel 数据
    updatePanelTop: 10000,
    updatePanelAnimationData: {},
    todoInputValue: '',

    // 事项列表
    itemList: []
  },

  onLoad: function() {
    let _this = this;
    wx.getSystemInfo( {
      success: ( data ) => {
        _this.setData( {
          updatePanelTop: data.windowHeight,
        });
      }
    });
    changeDate.call( this );
  },

  onReady: function() {
    loadItemListData.call( this );
  },

  datePickerChangeEvent: function( e ) {
    let date = new Date( Date.parse( e.detail.value ) );
    changeDate.call( this, new Date( date.getFullYear(), date.getMonth(), 1 ) );
  },

  changeDateEvent: function( e ) {
    let year = e.currentTarget.dataset.year;
    let month = e.currentTarget.dataset.month;
    changeDate.call( this, new Date( year, parseInt( month ) - 1, 1 ) );
  },

  dateClickEvent: function( e ) {
    let dataset = e.currentTarget.dataset;
    let year = dataset.year,
      month = dataset.month,
      date = dataset.date,
      data = this.data.data
      // dates,
      // tmp,
      // selectDateText
      ;

    // data[ 'selected' ][ 'year' ] = year;
    // data[ 'selected' ][ 'month' ] = month;
    // data[ 'selected' ][ 'date' ] = date;

    // selectDateText = year + '年' + month + '月' + date + '日';
    // this.setData( { data: data, selectDateText: selectDateText });

    if( !( data[ 'currentYear' ] == year && data[ 'currentMonth' ] == month && data[ 'currentDate' ] == date ) ) {
      changeDate.call( this, new Date( year, parseInt( month ) - 1, date ) );
    }

  },

  showUpdatePanelEvent: function() {
    showUpdatePanel.call( this );
  },

  closeUpdatePanelEvent: function() {
    closeUpdatePanel.call( this );
  },
  editClickEvent: function() {
    this.setData( { isEditMode: true });
  },
  cancelEditClickEvent: function() {
    this.setData( { isEditMode: false });
  },

  showSelectLevelEvent: function() {
    this.setData( { isSelectLevelASShow: true });
  },

  // 事项内容文本框变化事件
  todoInputChangeEvent: function( e ) {
    let value = e.detail.value;
    this.setData( { todoInputValue: value });
  },

  // 选择事项等级事件
  levelClickEvent: function( e ) {
    let level = e.currentTarget.dataset.level;
    this.setData( { levelSelectedValue: level });
  },

  // 保存事项数据
  saveDataEvent: function() {
    let todoValue = this.data.todoInputValue;
    let levelValue = this.data.levelSelectedValue;
    let showYear = this.data.data.showYear;
    let showMonth = this.data.data.showMonth;
    let showDate = this.data.data.showDate;
    if( todoValue != '' && levelValue ) {
      new DataService( {
        content: todoValue,
        level: levelValue,
        date: new Date( Date.parse( showYear + '-' + showMonth + '-' + showDate ) ).getTime()
      }).save();
      closeUpdatePanel.call( this );
      loadItemListData.call( this );
    } else {
      this.setData( {
        isModalShow: true,
        isMaskShow: true,
        modalMsg: '请填写事项内容'
      });
    }
  },

  listItemClickEvent: function( e ) {
    let isEditMode = this.data.isEditMode;
    if( !isEditMode ) return;

    let id = e.currentTarget.dataset.id;
    let data = this.data.itemList || [];
    let index = data.findIndex(( item ) => {
      return item[ '_id' ] == id;
    });
    if( index >= 0 ) {
      data[ index ][ 'active' ] = !data[ index ][ 'active' ];
      this.setData( { itemList: data });
    }
  },

  // 提示模态窗口显示
  closeModalEvent: function() {
    this.setData( { isModalShow: false, isMaskShow: false });
  }
});

function showUpdatePanel() {
  let animation = wx.createAnimation( {
    duration: 600
  });
  animation.translateY( '-100%' ).step();
  this.setData( {
    updatePanelAnimationData: animation.export()
  });
}

function closeUpdatePanel() {
  let animation = wx.createAnimation( {
    duration: 600
  });
  animation.translateY( '100%' ).step();
  this.setData( {
    updatePanelAnimationData: animation.export()
  });
}

function loadItemListData() {
  let year = this.data.data.showYear;
  let month = this.data.data.showMonth;
  let date = this.data.data.showDate;
  let data = DataService.findByDate( new Date( Date.parse( year + '-' + month + '-' + date ) ) );
  console.log( data );
  this.setData( { itemList: data });
}

/**
 * 变更日期数据
 * @param {Date} targetDate 当前日期对象
 */
function changeDate( targetDate ) {
  let date = targetDate || new Date();
  let currentDateObj = new Date();

  let showMonth, //当天显示月份
    showYear, //当前显示年份
    showDay, //当前显示星期
    showDate, //当前显示第几天
    showMonthFirstDateDay, //当前显示月份第一天的星期
    showMonthLastDateDay, //当前显示月份最后一天的星期
    showMonthDateCount; //当前月份的总天数

  let data = [];

  showDate = date.getDate();
  showMonth = date.getMonth() + 1;
  showYear = date.getFullYear();
  showDay = date.getDay();

  showMonthDateCount = new Date( showDate, showMonth, 0 ).getDate();
  date.setDate( 1 );
  showMonthFirstDateDay = date.getDay();
  date.setDate( showMonthDateCount );
  showMonthLastDateDay = date.getDay();

  let beforeDayCount = 0,
    beforeYear, //上页月年份
    beforMonth, //上页月份
    afterYear, //下页年份
    afterMonth, //下页月份
    afterDayCount = 0, //上页显示天数
    beforeMonthDayCount = 0; //上页月份总天数

  //上一个月月份
  beforMonth = showMonth == 1 ? 12 : showMonth - 1;
  //上一个月年份
  beforeYear = showMonth == 1 ? showYear - 1 : showYear;
  //下个月月份
  afterMonth = showMonth == 12 ? 1 : showMonth + 1;
  //下个月年份
  afterYear = showMonth == 12 ? showYear + 1 : showYear;

  //获取上一页的显示天数
  if( showMonthFirstDateDay != 0 )
    beforeDayCount = showMonthFirstDateDay - 1;
  else
    beforeDayCount = 6;

  //获取下页的显示天数
  if( showMonthLastDateDay != 0 )
    afterDayCount = 7 - showMonthLastDateDay;
  else
    showMonthLastDateDay = 0;

  //如果天数不够6行，则补充完整
  let tDay = showMonthDateCount + beforeDayCount + afterDayCount;
  if( tDay <= 35 )
    afterDayCount += ( 42 - tDay );

  let selected = this.data.data[ 'selected' ] || {};

  data = {
    currentDate: currentDateObj.getDate(), //当天日期第几天
    currentYear: currentDateObj.getFullYear(), //当天年份
    currentDay: currentDateObj.getDay(), //当天星期
    currentMonth: currentDateObj.getMonth() + 1, //当天月份
    showMonth: showMonth, //当前显示月份
    showDate: showDate, //当前显示月份的第几天 
    showYear: showYear, //当前显示月份的年份
    beforeYear: beforeYear, //当前页上一页的年份
    beforMonth: beforMonth, //当前页上一页的月份
    afterYear: afterYear, //当前页下一页的年份
    afterMonth: afterMonth, //当前页下一页的月份
    selected: selected //当前被选择的日期信息
  };

  let dates = [];

  if( beforeDayCount > 0 ) {
    beforeMonthDayCount = new Date( beforeYear, beforMonth, 0 ).getDate();
    for( let fIdx = 0;fIdx < beforeDayCount;fIdx++ ) {
      dates.unshift( {
        year: beforeYear,
        month: beforMonth,
        date: beforeMonthDayCount - fIdx
      });
    }
  }

  for( let cIdx = 1;cIdx <= showMonthDateCount;cIdx++ ) {
    dates.push( {
      active: showDate == cIdx,
      //active: ( selected[ 'year' ] == showYear && selected[ 'month' ] == showMonth && selected[ 'date' ] == cIdx ), //选中状态判断
      year: showYear,
      month: showMonth,
      date: cIdx
    });
  }

  if( afterDayCount > 0 ) {
    for( let lIdx = 1;lIdx <= afterDayCount;lIdx++ ) {
      dates.push( {
        year: afterYear,
        month: afterMonth,
        date: lIdx
      });
    }
  }

  data.dates = dates;
  this.setData( { data: data, pickerDateValue: showYear + '-' + showMonth });
}
