import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewChild
} from "@angular/core";
import * as d3 from "d3";
import * as DateFns from "date-fns";
import * as _ from "lodash";
//import {Delaunay} from "d3-delaunay";

@Component({
  selector: "jj-stacked-chart",
  templateUrl: "./stacked.html",
  // styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedComponent {
  title = "D3 Sandbox";
  tabIndex = 1;
  series;

  @ViewChild("gEle") gElement;
  @Input() Margin = 100;
  @Input() Height = 400;
  @Input() Width = 700;
  @Input() ZoomScaleExtent: [number, number];
  @Input() AllowZoomX = true;
  @Input() xExtent: [Date, Date];
  @Input() AllowZoomY = false;
  @Input() DisableWheelZoom = true;
  @Input() Data = [
    { date: new Date(), seg1: 1, seg2: .06, seg3: .08, seg4: .3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2 },
    { date: DateFns.addDays(new Date(), 1), seg1: 1, seg2: .1, seg3: .06, seg4: .3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2 },
    { date: DateFns.addMonths(new Date(), 2), seg1: 1, seg2: 1, seg3: 2, seg4: 3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2 }
  ];

  bar1Offset = -15;
  bar2Offset = 15;
  bar2Width = 10;
  textOffset = -35;
  barWidth = 30;
  xAxis;
  yAxis;
  timeFormat;

  dateData;
  textEl;
  textEl2;
  lineEl;
  lineEl2;
  rectEle1;
  rectEle2;
  xAxisElement;
  x;
  y;
  color;
  color2;
  isSmartLabelsOn: boolean;
  isSmartAxisOn: boolean;
  textData;
  textData2;
  zoom;
  zoomedX;
  zoomedY;
  static _nextUniqueId = 0;
  UniqueId = StackedComponent._nextUniqueId++; 
  graphContainer;

  ngOnInit() {
    this.initStackedChart();
  }

  initStackedChart() {
    var d3G = d3
      .select(this.gElement.nativeElement)
      .attr("transform", `translate(${this.Margin},${this.Margin})`);
    d3G.selectAll("g").remove();

    d3G.append("clipPath")
      .attr("id", `clip-${this.UniqueId}`)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.Width)
      .attr("height", this.Height+this.Margin);

    this.graphContainer = d3G.append("g")
      .attr("clip-path", `url(#clip-${this.UniqueId})`)
      .append("g");

    var minDate = DateFns.min(..._.map(this.Data, d => d.date));
    var maxDate = DateFns.max(..._.map(this.Data, d => d.date));

    var timeSpan = maxDate.getTime() - minDate.getTime();
    var keys = ["seg1", "seg2", "seg3", "seg4", "seg5", "seg6", "seg7", "seg8", "seg9"];

    this.x = d3
      .scaleTime()
      .rangeRound([0, this.Width])
      .domain([new Date(minDate.getTime() - timeSpan * .3), new Date(maxDate.getTime() + timeSpan * .3)]);
    this.zoomedX = this.x;
    
    this.y = d3
      .scaleLinear()
      .range([this.Height, 0])
      .domain([0, d3.max(this.Data, d => _.sumBy(keys, k => d[k] || 0))]);
    this.zoomedY = this.y;

    this.timeFormat = d3.timeFormat("%c");
    this.xAxis = d3
      .axisBottom(this.x)
      .tickValues(
        _(this.Data)
          .map(d => d.date)
          .value()
      )
      .tickFormat(d => this.timeFormat(d));
    this.yAxis = d3.axisRight(this.y);

    this.series = d3.stack().keys(keys)(this.Data as any);

    this.color = d3
      .scaleOrdinal()
      .domain(this.series.map(d => d.key))
      .range(
        d3
          .quantize(t => d3.interpolateRainbow(t * 0.8 + 0.3), this.series.length)
          .reverse()
      )
      .unknown("#ccc");

    this.color2 = d3
      .scaleOrdinal()
      .domain(this.series.map(d => d.key))
      .range(
        d3
          .quantize(t => d3.interpolateSpectral(t * 0.5 + 0.1), this.series.length)
          .reverse()
      )
      .unknown("#ccc");
  
    
    this.xAxisElement = this.graphContainer
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${this.Height})`);

    this.xAxisElement.call(this.xAxis)
      .selectAll("text")
      .attr("y", 10)
      .attr("x", 5)
      //   .attr("dy", ".35em")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");

    d3G
      .append("g")
      .attr("transform", `translate(${this.Width},0)`)
      .call(this.yAxis);


    this.rectEle1 = this.graphContainer
      .append("g")
      .selectAll("g")
      .data(this.series)
      .join("g")
      .attr("fill", d => this.color(d.key) as any)
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", (d, i) => this.x(d.data.date) + this.bar1Offset)
      .attr("y", d => this.y(d[1]))
      .attr("height", d => this.y(d[0]) - this.y(d[1]))
      .attr("width", this.barWidth); // x.bandwidth());

    this.rectEle2 = this.graphContainer
      .append("g")
      .selectAll("g")
      .data(this.series)
      .join("g")
      .attr("fill", d => this.color2(d.key) as any)
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", (d, i) => this.x(d.data.date) + this.bar2Offset)
      .attr("y", d => this.y(d[1] * 0.5))
      .attr("height", d => this.y(d[0] * 0.5) - this.y(d[1] * 0.5))
      .attr("width", this.bar2Width);



    // this.smartLabelForceLayout(d3G, x, y, color);
    this.initializeTextData();

    this.textEl = this.graphContainer.append("g")
      .selectAll("g")
      .data(this.textData)
      .join("text")
      .attr("fill", d => this.color(d.key) as any)
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .text((d, i) => _.round(d.value, 2))
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle");
    
    this.textEl2 = this.graphContainer.append("g")
      .selectAll("g")
      .data(this.textData2)
      .join("text")
      .attr("fill", d => this.color2(d.key) as any)
      .attr("x", d => d.x  )
      .attr("y", d => d.y)
      .text((d, i) => _.round(d.value, 2))
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "middle");    

    this.lineEl = this.graphContainer.append("g")
      .selectAll("g")
      .data(this.textData)
      .join("line")
      .style("stroke", d => this.color(d.key) as any)
      .attr("x1", (d, i) => d.x)
      .attr("y1", d => d.y)
      .attr("x2", (d, i) => d.x - this.textOffset)
      .attr("y2", d => d.y);
    
    this.lineEl2 = this.graphContainer.append("g")
        .selectAll("g")
        .data(this.textData2)
        .join("line")
        .style("stroke", d => this.color2(d.key) as any)
        .attr("x1", (d, i) => d.x)
        .attr("y1", d => d.y)
        .attr("x2", (d, i) => d.x + this.textOffset +   this.bar2Width / 2 )
        .attr("y2", d => d.y);
    
      
    // this.smartLabelForceLayout(textData, textEl, lineEl);

    this.initializeDateData();
    //  this.smartAxisForceLayout(dateData, textEl, lineEl, rectEle1, rectEle2,xAxisElement,x);

    this.setupZoomBehavior(d3G); 
  }

  toggleSmartLabels() {
    if (this.isSmartLabelsOn) {
      if (this.labelSim) {
        this.labelSim.stop();
        this.resetTextData();
      }
      this.simUpdate(true);
    }
    else {
      this.smartLabelForceLayout();
    }

    this.isSmartLabelsOn = !this.isSmartLabelsOn;
  }

  toggleSmartAxis() {
    if (this.isSmartAxisOn) {
      if (this.axisSim) {
        this.axisSim.stop();
        this.initializeDateData();
      }
      this.simUpdate(true);
    }
    else
      this.smartAxisForceLayout();
    this.isSmartAxisOn = !this.isSmartAxisOn;
  }

  initializeDateData() {
    this.dateData = _.map(this.Data, d => {
      return {
        date: d.date,
        origX: this.x(d.date),
        x: this.x(d.date),
        y: 0,
      };
    }
    );
    this.xOffsetByDate = _.keyBy(this.dateData, d => d.date);
  }
  initializeTextData() {
    this.textData = _.flatMap(this.series, d => _.map(d, dd => { return { key: d.key, x: this.x(dd.data.date) + this.textOffset - this.barWidth / 2, y: this.y(dd[1] - (dd[1] - dd[0]) / 2), value: dd[1] - dd[0], date: dd.data.date, origItem: dd } }));
    this.textData2 = _.flatMap(this.series, d => _.map(d, dd => { return { key: d.key, x: this.x(dd.data.date) - this.textOffset + this.bar2Offset+ this.bar2Width/2, y: this.y(dd[1] * 0.5 - (dd[1] * 0.5 - dd[0] * 0.5) / 2), value: dd[1] * 0.5 - dd[0] * 0.5, date: dd.data.date, origItem: dd } }));
  }

  resetTextData() {
    _.each(this.textData, d => {
      d.x = this.x(d.date) + this.textOffset - this.barWidth / 2;
      d.y = this.y(d.origItem[1] - (d.origItem[1] - d.origItem[0]) / 2);
    });

    _.each(this.textData2, d => {
      d.x = this.x(d.date) - this.textOffset + this.bar2Offset + this.bar2Width / 2;
      d.y = this.y((d.origItem[1] - (d.origItem[1] - d.origItem[0]) / 2)*0.5);
    });
  }
 
  labelSim;
  labelSim2;
  axisSim;

  smartLabelForceLayout() {

    this.labelSim = d3.forceSimulation(this.textData)
      //.force('charge', d3.forceManyBody().strength(1))
      .force('x', d3.forceX().x(function (d) {
        return d.x
      }))
      .force('collision', d3.forceCollide().radius(function (d) {
        return 7;
      }))
      .on('tick', this.simUpdate.bind(this));
    
    this.labelSim2 = d3.forceSimulation(this.textData2)
      //.force('charge', d3.forceManyBody().strength(1))
      .force('x', d3.forceX().x(function (d) {
        return d.x
      }))
      .force('collision', d3.forceCollide().radius(function (d) {
        return 7;
      }))
      .on('tick', this.simUpdate.bind(this));

  }

  setupZoomBehavior(d3G) {
    this.zoom = d3.zoom()
      //  .wheelDelta( ()=>  -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1) / 800 )
      .on("zoom", () => this.zoomUpdate())
      ;

    if (this.ZoomScaleExtent) {
      this.zoom = this.zoom.scaleExtent(this.ZoomScaleExtent);
    }

    if (this.xExtent) {
      this.zoom.
        translateExtent([[this.x(this.xExtent[0]), 0], [Math.max(this.Width-this.Margin*2, this.x(this.xExtent[1])), Infinity]])
    }
    if (this.DisableWheelZoom)
      this.zoom.filter(() => {
        return !d3.event || (!d3.event.button && !d3.event.wheelDelta);
      });

    this.zoomPane = d3G.append("rect")
      .attr("class", "zoomPane")
      .attr("width", this.Width)
      .attr("height", this.Height)
      .call(this.zoom)
      .on("wheel.zoom", null);
  }
  zoomPane;

  zoomUpdate(includeTransitions = false) {

    // if(this.xDomain) {
    //     var tx = d3.zoomIdentity.x,
    //         ty = d3.zoomIdentity.y;

    //     tx = Math.min(tx, 0);
    //     tx = Math.max(tx, this.width - this.zoomedX(this.xDomain[1]));
    //     d3.zoomIdentity.translate(tx, ty);
    // }
    if (d3.event != null && d3.event.transform && this.AllowZoomX) {
      this.zoomedX = d3.event.transform.rescaleX(this.x);
    }
    else {
      this.zoomedX = this.zoomedX ? this.zoomedX : this.x;
    }

    if (d3.event != null && d3.event.transform && this.AllowZoomY) {
      this.zoomedY = d3.event.transform.rescaleY(this.y);
    }
    else {
      this.zoomedY = this.zoomedY ? this.zoomedY : this.y;
    }

    this.simUpdate(includeTransitions); 
  }
  xOffsetByDate;
  smartAxisForceLayout() {
    this.axisSim = d3.forceSimulation(this.dateData)
      //.force('charge', d3.forceManyBody().strength(1))
      .force('y', d3.forceY().y(function (d) {
        return d.y
      }))
      .force('collision', d3.forceCollide().radius(function (d) {
        return 60;
      }))
      .on('tick', this.simUpdate.bind(this));
  }

  transitionDuration = 1000;
 

  getXSimOffset(date) {
    return this.xOffsetByDate[date].x - this.xOffsetByDate[date].origX;
  }

  simUpdate(useTransition = false) {
    //  this.xOffsetByDate = _.keyBy(this.dateData, d => d.date);
    let transitionDuration = useTransition ? this.transitionDuration : 0;
    
    this.xAxis = d3
      .axisBottom(this.zoomedX)
      .tickValues(
        _.map(this.Data, d => this.zoomedX.invert(this.zoomedX(d.date) + this.getXSimOffset(d.date)))
      )
      .tickFormat((d, idx) => this.timeFormat(this.Data[idx].date));
    
    var rescaledXAxis = this.xAxis.scale(this.zoomedX)
    this.xAxisElement
      .transition()
      .duration(transitionDuration)
      .call(rescaledXAxis)
      .selectAll("text")
      .attr("transform", "rotate(45)")
      // .attrTween("transform", () => d3.interpolateTransformSvg("rotate(45)", "rotate(45)"))
      .attr("y", 10)
      .attr("x", 5)
      //   .attr("dy", ".35em")
      .style("text-anchor", "start");

    this.textEl.transition()
      .duration(transitionDuration)
      .attr("y", d => d.y)
      .attr("x", d => this.zoomedX(d.date) + this.textOffset - this.barWidth / 2+ this.getXSimOffset(d.date));
    this.lineEl.transition()
      .duration(transitionDuration)
      .attr("y1", d => d.y)
      .attr("x1", (d, i) => this.zoomedX(d.date) + this.textOffset - this.barWidth / 2 + this.getXSimOffset(d.date))
      .attr("x2", (d, i) => this.zoomedX(d.date)   - this.barWidth / 2 + this.getXSimOffset(d.date));
    
    this.textEl2.transition()
      .duration(transitionDuration)
      .attr("y", d => d.y)
      .attr("x", d => this.zoomedX(d.date) - this.textOffset + this.bar2Offset + this.bar2Width / 2 + this.getXSimOffset(d.date));
    this.lineEl2.transition()
      .duration(transitionDuration)
      .attr("y1", d => d.y)  
     .attr("x1", (d, i) => this.zoomedX(d.date) - this.textOffset + this.bar2Offset + this.bar2Width / 2+ this.getXSimOffset(d.date))
      .attr("x2", (d, i) => this.zoomedX(d.date) + this.bar2Offset + this.bar2Width / 2 + this.getXSimOffset(d.date))
    
    this.rectEle1
      .transition()
      .duration(transitionDuration).attr("x", (d, i) => this.zoomedX(d.data.date) + this.bar1Offset + this.getXSimOffset(d.data.date))
    this.rectEle2
      .transition()
      .duration(transitionDuration).attr("x", (d, i) => this.zoomedX(d.data.date) + this.bar2Offset + this.getXSimOffset(d.data.date))
  }

  stopSims() {
    this.axisSim.stop();
    this.labelSim.stop();
    this.labelSim2.stop();
  }

  resetChart() {
    if (this.axisSim) {
      this.axisSim.stop();
      this.initializeDateData();
    }
    if (this.labelSim) {
      this.labelSim.stop();
      this.labelSim2.stop();
      this.resetTextData();
    }
    this.simUpdate(true);

    this.isSmartLabelsOn = false;
    this.isSmartAxisOn = false;
    //   this.initStackedChart();
  }
}
