<template>
  <Layout>
    <Content>
      <Breadcrumb>
        <BreadcrumbItem>运维分析</BreadcrumbItem>
        <BreadcrumbItem>网站监控</BreadcrumbItem>
      </Breadcrumb>
      <Card>
        <Card>
          <Row type="flex" justify="space-between">
            <Col style="width:33%; text-align: center;">
              <p>今日接口调用数</p>
              <h3>{{invokingNum}}</h3>
            </Col>
            <Col style="width:33%; text-align: center;">
              <p>今日活跃应用数</p>
              <h3>{{appNum}}</h3>
            </Col>
            <Col style="width:33%; text-align: center;">
              <p>今日活跃用户数</p>
              <h3>{{userNum}}</h3>
            </Col>
          </Row>
        </Card>
        <Row type="flex" justify="space-between">
          <Col style="width: 49%">
            <chart-card title="接口调用趋势">
              <chartLine ref="websiteChart1" el="websiteChart1" :lineOption="websiteChart1Option">
                <div id="websiteChart1" style="height: 400px;"></div>
              </chartLine>
            </chart-card>
          </Col>
          <Col style="width: 49%">
            <chart-card title="用户登陆趋势">
              <chartLine ref="websiteChart2" el="websiteChart2" :lineOption="websiteChart2Option">
                <div id="websiteChart2" style="height: 400px;"></div>
              </chartLine>
            </chart-card>
          </Col>
        </Row>
        <Row type="flex" justify="space-between">
          <Col style="width: 49%">
            <chart-card title="本月接口调用top5">
              <chartBar ref="websiteChart3" el="websiteChart3" :barOption="websiteChart3Option">
                <div id="websiteChart3" style="height: 400px;"></div>
              </chartBar>
            </chart-card>
          </Col>
          <Col style="width: 49%">
            <chart-card title="本月活跃应用top5">
              <chartBar ref="websiteChart4" el="websiteChart4" :barOption="websiteChart4Option">
                <div id="websiteChart4" style="height: 400px;"></div>
              </chartBar>
            </chart-card>
          </Col>
        </Row>
      </Card>
    </Content>
  </Layout>
</template>

<script>
import api from '@/api/axiosApi'
import operationApiList from '@/api/operationApiList'
// echart图外层容器，包括卡片样式
import chartCard from '@/view/home/chartCard.vue'
import chartLine from './../echarts/ChartLine.vue'
import chartBar from './../echarts/bar.vue'
// echart图的一些共用的配置
import {areaLine, horizontalBar} from '@/assets/js/echartOption'

const label = {
  show: true,
  color: '#fff',
  position: [10, '50%'],
  distance: 0,
  align: 'left',
  verticalAlign: 'middle',
  rotate: 0,
  formatter: '{b}',
  fontSize: 12
}
const markPoint = {
  symbol: 'rect',
  label: {
    color: '#000',
    formatter: '{a}{b}{c}'
  }
}
export default {
  components: {
    chartCard,
    chartBar,
    chartLine
  },
  data () {
    return {
      invokingNum: 0,
      appNum: 0,
      userNum: 0,
      websiteChart1Option: areaLine(),
      websiteChart2Option: areaLine(),
      websiteChart3Option: horizontalBar(),
      websiteChart4Option: horizontalBar(),
      commonXdata: []
    }
  },
  mounted() {
    this.webMonitor()
  },
  methods: {
    // 获取网站监控的数据
    webMonitor () {
      const vm = this
      api(operationApiList.webMonitor)
      .then(res => {
        if (res.data.errcode === 0) {
          const data = res.data.data
          vm.commonXdata = data.monthDayArray
          vm.invokingNum = data.invokingNum
          vm.appNum = data.appNum
          vm.userNum = data.userNum
          vm.drawWebsiteChart1(data.invokingCurrList, data.invokingUpList)
          vm.drawWebsiteChart2(data.userCurrList, data.userUpList)
          vm.drawWebsiteChart3(data.invokingTop)
          vm.drawWebsiteChart4(data.appTop)
        } else {
          vm.$Message.info(res.data.errmsg)
        }
      }, err => {console.log(err)})
    },
    // 接口调用趋势
    drawWebsiteChart1 (cur, up) {
      this.websiteChart1Option.tooltip = {
        trigger: 'axis',
        formatter: '{b}号<br>{a0}:{c0}<br>{a1}:{c1}'
      }
      this.websiteChart1Option.legend = {
        data: ['上月', '本月'],
        left: 'center',
        bottom: 10
      }
      this.websiteChart1Option.xAxis.data = this.commonXdata
      this.websiteChart1Option.series[0].data = up
      this.websiteChart1Option.series[0].name = '上月'
      this.websiteChart1Option.series.push({
        name: '本月',
        type: 'line',
        smooth: true,
        symbol: 'none',
        sampling: 'average',
        itemStyle: {
          normal: {
            color: '#487EC1'
          }
        },
        areaStyle: {
          normal: {
            color: '#48B9C1'
          }
        },
        data: cur
      })
      this.$refs.websiteChart1.refresh()
    },
    // 用户登陆趋势
    drawWebsiteChart2 (cur, up) {
      this.websiteChart2Option.tooltip = {
        trigger: 'axis',
        formatter: '{b}号<br>{a0}:{c0}<br>{a1}:{c1}'
      }
      this.websiteChart2Option.legend = {
        data: ['上月', '本月'],
        left: 'center',
        bottom: 10
      }
      this.websiteChart2Option.xAxis.data = this.commonXdata
      this.websiteChart2Option.series[0].data = up
      this.websiteChart2Option.series[0].name = '上月'
      this.websiteChart2Option.series.push({
        name: '本月',
        type: 'line',
        smooth: true,
        symbol: 'none',
        sampling: 'average',
        itemStyle: {
          normal: {
            color: 'rgb(255, 70, 131)'
          }
        },
        areaStyle: {
          normal: {
            color: 'rgba(255, 70, 131, 0.2)'
          }
        },
        data: cur
      })
      this.$refs.websiteChart2.refresh()
    },
    // 本月接口调用top5
    drawWebsiteChart3 (top) {
      const name = []
      const count = []
      top.map(item => {
        name.unshift(item.moduleApiUrl.match(/\/api.*$/)[0])
        count.unshift(Number(item.totalNum))
      })
      const max = Math.max(...count)
      this.websiteChart3Option.tooltip = {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '接口：{b1}<br>调用次数：{c1}'
      }
      this.websiteChart3Option.markPoint = markPoint
      this.websiteChart3Option.yAxis.data = name
      this.websiteChart3Option.yAxis.show = false
      this.websiteChart3Option.xAxis.max = max
      this.websiteChart3Option.xAxis.splitLine = {
        show: false
      }
      this.websiteChart3Option.xAxis.axisTick = {
        show: false
      }
      this.websiteChart3Option.series[0].label = label
      this.websiteChart3Option.series[0].data = count
      this.websiteChart3Option.series.unshift({
        type: 'bar',
        barGap: '-100%',
        color: '#F2F2F2',
        // 填充最大值
        data: new Array(this.websiteChart3Option.series[0].data.length).fill(max)
      })
      this.$refs.websiteChart3.refresh()
    },
    // 本月活跃应用top5
    drawWebsiteChart4 (top) {
      const name = []
      const count = []
      top.map(item => {
        name.unshift(item.moduleApiUrl.match(/\/api.*$/)[0])
        count.unshift(Number(item.totalNum))
      })
      const max = Math.max(...count)
      this.websiteChart4Option.tooltip = {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '接口：{b1}<br>调用次数：{c1}'
      }
      this.websiteChart4Option.markPoint = markPoint
      this.websiteChart4Option.yAxis.data = name
      this.websiteChart4Option.yAxis.show = false
      this.websiteChart4Option.xAxis.max = max
      this.websiteChart4Option.xAxis.splitLine = {
        show: false
      }
      this.websiteChart4Option.xAxis.axisTick = {
        show: false
      }
      this.websiteChart4Option.series[0].label = label
      this.websiteChart4Option.series[0].data = count
      this.websiteChart4Option.series.unshift({
        type: 'bar',
        barGap: '-100%',
        color: '#F2F2F2',
        // 填充最大值
        data: new Array(this.websiteChart4Option.series[0].data.length).fill(max)
      })
      this.$refs.websiteChart4.refresh()
    },
  }
}
</script>
