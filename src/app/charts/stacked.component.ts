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
  series2;

  @ViewChild("gEle") gElement;
  @Input() Margin = 100;
  @Input() Height = 400;
  @Input() Width = 700;
  @Input() ZoomScaleExtent: [number, number];
  @Input() AllowZoomX = true;
  @Input() xExtent: [Date, Date];
  @Input() AllowZoomY = false;
  @Input() DisableWheelZoom = true;
  @Input() IsTimeScale = false;
  @Input() InitialDataMarginPercent = .3;
  @Input() XKeyProperty = "name";
  @Input() DoRotateXLabels: boolean;
  @Input() Bar1Colors: string[];
  @Input() Bar2Colors: string[];
  @Input() GlidePaths: GlidePath[];
  @Input() ShowGlidePaths = true;

  @Input() DataSegmentProperties: string[] = ["seg1", "seg2", "seg3", "seg4", "seg5", "seg6", "seg7", "seg8", "seg9", "seg10"];
  @Input() DataSegmentProperties2: string[] = ["seg1", "seg2", "seg3"  ];
  @Input() Data;
  bar1Offset = -15;
  bar2Offset = 15;
  bar2Width = 10;
  textOffset = -35;
  barWidth = 30;
  xAxis;
  yAxis;
  timeFormat;

  xData;
  textEl;
  textEl2;
  lineEl;
  lineEl2;
  rectEle1;
  rectEle2;
  xAxisElement;
  x;
  y;
  y2;
  color;
  color2;
  isSmartLabelsOn: boolean;
  isSmartAxisOn: boolean;
  textData;
  textData2;
  zoom;
  zoomedX;
  zoomedY;
  zoomedY2;
  glideLines;
  static _nextUniqueId = 0;
  UniqueId = StackedComponent._nextUniqueId++;
  graphContainer;


  ngOnInit() {
    this.initStackedChart();
  }

  ngOnChanges(changes: any) {
    if (changes.Data != null) {
      this.initStackedChart();
    }
    
    if (changes.ShowGlidePaths != null) {
      this.simUpdate();
    }
  }
  initStackedChart() {
    var d3G = d3
      .select(this.gElement.nativeElement)
      .attr("transform", `translate(${this.Margin},${this.Margin})`);
    d3G.selectAll("g").remove();

    if (!this.Data) return;

    d3G.append("clipPath")
      .attr("id", `clip-${this.UniqueId}`)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.Width)
      .attr("height", this.Height + this.Margin);

    this.graphContainer = d3G.append("g")
      .attr("clip-path", `url(#clip-${this.UniqueId})`)
      .append("g");

    if (this.IsTimeScale) {
      var minDate = DateFns.min(..._.map(this.Data, this.XKeyProperty));
      var maxDate = DateFns.max(..._.map(this.Data, this.XKeyProperty));

      var timeSpan = maxDate.getTime() - minDate.getTime();

      this.x = d3
        .scaleTime()
        .rangeRound([0, this.Width])
        .domain([new Date(minDate.getTime() - timeSpan * this.InitialDataMarginPercent), new Date(maxDate.getTime() + timeSpan * this.InitialDataMarginPercent)]);
    }
    else {
      var barWidth = (this.bar2Width + this.bar2Width + 30);
      var minChartContentWidth = this.Data.length * barWidth;

      this.x = d3
        .scaleLinear()
        .range([0, this.Width])
        .domain([-.35, minChartContentWidth < this.Width ? this.Data.length : this.Width / barWidth]);
    }
    this.zoomedX = this.x;

    this.y = d3
      .scaleLinear()
      .range([this.Height, 0])
      .domain([0, d3.max(this.Data, d =>   _.sumBy(this.DataSegmentProperties, k => d[k] || 0))]);
    this.zoomedY = this.y;

    this.y2 = d3
      .scaleLinear()
      .range([this.Height, 0])
      .domain([0, d3.max(this.Data, d => _.sumBy(this.DataSegmentProperties2, k => d[k] || 0))]);
    this.zoomedY2 = this.y2;

    this.timeFormat = d3.timeFormat("%c");

    var glidePathTickDates = this.ShowGlidePaths && !this.isSmartAxisOn ? _.map(this.GlidePaths, p => p.EndDate) : null;
    var chartTicks = _.map(this.Data, (d, idx) => this.IsTimeScale ? d[this.XKeyProperty] : idx);
    var allTicks = _.concat(chartTicks, glidePathTickDates).filter(t => t != null);;

    this.xAxis = d3
      .axisBottom(this.x)
      .tickValues(
        allTicks
      )
      .tickFormat((d, idx) => this.IsTimeScale ? this.timeFormat(allTicks[idx]) : this.Data[idx][this.XKeyProperty]);

    this.yAxis = d3.axisRight(this.y);

    this.series = d3.stack().keys(this.DataSegmentProperties)(this.Data as any);
    this.series2 = d3.stack().keys(this.DataSegmentProperties2)(this.Data as any);

    this.color = d3
      .scaleOrdinal()
      .domain(this.series.map(d => d.key))
      .range(this.Bar1Colors ||
        d3
          .quantize(t => d3.interpolateRainbow(t * 0.8 + 0.3), this.series.length)
          .reverse()
      )
      .unknown("#ccc");

    this.color2 = d3
      .scaleOrdinal()
      .domain(this.series2.map(d => d.key))
      .range(this.Bar2Colors ||
        d3
          .quantize(t => d3.interpolateSpectral(t * 0.5 + 0.1), this.series2.length)
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
      .attr("transform", this.DoRotateXLabels ? "rotate(45)" : undefined)
      .attr("x", this.DoRotateXLabels ? 5 : 0)
      .style("text-anchor", this.DoRotateXLabels ? "start" : undefined);

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
      .attr("x", (d, i) => this.zoomedX(this.IsTimeScale ? d.data[this.XKeyProperty] : i) + this.bar1Offset)
      .attr("y", d => this.zoomedY(d[1]))
      .attr("height", d => this.zoomedY(d[0]) - this.zoomedY(d[1]))
      .attr("width", this.barWidth); // x.bandwidth());

    this.rectEle2 = this.graphContainer
      .append("g")
      .selectAll("g")
      .data(this.series2)
      .join("g")
      .attr("fill", d => this.color2(d.key) as any)
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", (d, i) => this.zoomedX(this.IsTimeScale ? d.data[this.XKeyProperty] : i) + this.bar2Offset)
      .attr("y", d => this.zoomedY2(d[1] ))
      .attr("height", d => this.zoomedY2(d[0]  ) - this.zoomedY2(d[1] ))
      .attr("width", this.bar2Width);

    this.initializeTextData();
    
    if (this.GlidePaths) {
      this.glideLines = this.graphContainer.append("g")
        .selectAll("g")
        .data(this.GlidePaths)
        .join("line")
        .style("stroke", d => d.Stroke)
        .attr("x1", (d, i) => this.zoomedX(d.StartItem[this.XKeyProperty] ) )
        .attr("y1", d => this.zoomedY(_.sumBy(this.DataSegmentProperties, prop=>d.StartItem[prop])  ) )
        .attr("x2", (d, i) => this.zoomedX(d.EndDate))
        .attr("y2",  this.y(0));
    }

    // this.smartLabelForceLayout(d3G, x, y, color);

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
      .attr("x", d => d.x)
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
      .attr("x2", (d, i) => d.x + this.textOffset + this.bar2Width / 2)
      .attr("y2", d => d.y);


    // this.smartLabelForceLayout(textData, textEl, lineEl);

    this.initializeXData();
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
        this.initializeXData();
      }
      this.simUpdate(true);
    }
    else
      this.smartAxisForceLayout();
    this.isSmartAxisOn = !this.isSmartAxisOn;
  }

  initializeXData() {
    this.xData = _.map(this.Data, (d, idx) => {
      return {
        date: d.date,
        origX: this.x(this.IsTimeScale ? d[this.XKeyProperty] : idx),
        x: this.x(this.IsTimeScale ? d[this.XKeyProperty] : idx),
        y: 0,
        xKey: d[this.XKeyProperty]
      };
    }
    );
    this.xOffsetByKey = _.keyBy(this.xData, "xKey");
  }
  initializeTextData() {
    this.textData = _.flatMap(this.series, d => _.map(d, (dd, idx) => {
      var xVal = this.x(this.IsTimeScale ? dd.data[this.XKeyProperty] : idx);
      return {
        key: d.key,
        x: xVal + this.textOffset - this.barWidth / 2,
        y: this.y(dd[1] - (dd[1] - dd[0]) / 2), value: dd[1] - dd[0],
        origItem: dd,
        idx: idx,
      }
    }));
    this.textData2 = _.flatMap(this.series2, d => _.map(d, (dd, idx) => {
      var xVal = this.x(this.IsTimeScale ? dd.data[this.XKeyProperty] : idx);
      return {
        key: d.key,
        x: xVal - this.textOffset + this.bar2Offset + this.bar2Width / 2,
        y: this.y2(dd[1]  - (dd[1]   - dd[0]  ) / 2),
        value: dd[1]  - dd[0]  ,
        origItem: dd,
        idx: idx,
      }
    }));
  }

  resetTextData() {
    _.each(this.textData, (d, idx) => {
      d.x = this.x(this.IsTimeScale ? d.origItem.data[this.XKeyProperty] : d.idx) + this.textOffset - this.barWidth / 2;
      d.y = this.y(d.origItem[1] - (d.origItem[1] - d.origItem[0]) / 2);
    });

    _.each(this.textData2, d => {
      d.x = this.x(this.IsTimeScale ? d.origItem.data[this.XKeyProperty] : d.idx) - this.textOffset + this.bar2Offset + this.bar2Width / 2;
      d.y = this.y2((d.origItem[1] - (d.origItem[1] - d.origItem[0]) / 2)  );
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
        translateExtent([[this.x(this.xExtent[0]), 0], [Math.max(this.Width - this.Margin * 2, this.x(this.xExtent[1])), Infinity]])
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
      this.zoomedY2 = d3.event.transform.rescaleY(this.y2);
    }
    else {
      this.zoomedY = this.zoomedY ? this.zoomedY : this.y;
      this.zoomedY2 = this.zoomedY2 ? this.zoomedY2 : this.y2;
    }

    this.simUpdate(includeTransitions);
  }
  xOffsetByKey;
  smartAxisForceLayout() {
    this.axisSim = d3.forceSimulation(this.xData)
  //    .force('charge', d3.forceManyBody().strength(1))
      .force('y', d3.forceY().y(function (d) {
        return d.y
      }))
      .force('collision', d3.forceCollide().radius(function (d) {
        return 80;
      }))
      .on('tick', this.simUpdate.bind(this));
  }

  transitionDuration = 1000;


  getXSimOffset(key) {
    return this.xOffsetByKey[key].x - this.xOffsetByKey[key].origX;
  }

  simUpdate(useTransition = false) {
    //  this.xOffsetByDate = _.keyBy(this.dateData, d => d.date);
    let transitionDuration = useTransition ? this.transitionDuration : 0;

    var glidePathTickDates = this.ShowGlidePaths && !this.isSmartAxisOn && this.IsTimeScale? _.map(this.GlidePaths, p => p.EndDate):null;
    var chartTicks = _.map(this.Data, (d, idx) => this.zoomedX.invert(this.zoomedX(this.IsTimeScale ? d[this.XKeyProperty] : idx) + this.getXSimOffset(d[this.XKeyProperty])));
    var allTicks = _.concat(chartTicks, glidePathTickDates).filter(t=>t!=null);

    this.xAxis = d3
      .axisBottom(this.zoomedX)
      .tickValues(
        allTicks
      )
      .tickFormat((d, idx) => this.IsTimeScale ? this.timeFormat(allTicks[idx]) : this.Data[idx][this.XKeyProperty]);

    var rescaledXAxis = this.xAxis.scale(this.zoomedX)
    this.xAxisElement
      .transition()
      .duration(transitionDuration)
      .call(rescaledXAxis)
      .selectAll("text")
      .attr("transform", this.DoRotateXLabels ? "rotate(45)" : undefined)
      // .attrTween("transform", () => d3.interpolateTransformSvg("rotate(45)", "rotate(45)"))
      .attr("y", 10)
      .attr("x", this.DoRotateXLabels ? 5 : 0)
      //   .attr("dy", ".35em")
      .style("text-anchor", this.DoRotateXLabels ? "start" : undefined);

    this.textEl.transition()
      .duration(transitionDuration)
      .attr("y", d => d.y)
      .attr("x", d => this.zoomedX(this.IsTimeScale ? d.origItem.data[this.XKeyProperty] : d.idx) + this.textOffset - this.barWidth / 2 + this.getXSimOffset(d.origItem.data[this.XKeyProperty]));
    this.lineEl.transition()
      .duration(transitionDuration)
      .attr("y1", d => d.y)
      .attr("x1", (d, i) => this.zoomedX(this.IsTimeScale ? d.origItem.data[this.XKeyProperty] : d.idx) + this.textOffset - this.barWidth / 2 + this.getXSimOffset(d.origItem.data[this.XKeyProperty]))
      .attr("x2", (d, i) => this.zoomedX(this.IsTimeScale ? d.origItem.data[this.XKeyProperty] : d.idx) - this.barWidth / 2 + this.getXSimOffset(d.origItem.data[this.XKeyProperty]));

    this.textEl2.transition()
      .duration(transitionDuration)
      .attr("y", d => d.y)
      .attr("x", d => this.zoomedX(this.IsTimeScale ? d.origItem.data[this.XKeyProperty] : d.idx) - this.textOffset + this.bar2Offset + this.bar2Width / 2 + this.getXSimOffset(d.origItem.data[this.XKeyProperty]));
    this.lineEl2.transition()
      .duration(transitionDuration)
      .attr("y1", d => d.y)
      .attr("x1", (d, i) => this.zoomedX(this.IsTimeScale ? d.origItem.data[this.XKeyProperty] : d.idx) - this.textOffset + this.bar2Offset + this.bar2Width / 2 + this.getXSimOffset(d.origItem.data[this.XKeyProperty]))
      .attr("x2", (d, i) => this.zoomedX(this.IsTimeScale ? d.origItem.data[this.XKeyProperty] : d.idx) + this.bar2Offset + this.bar2Width / 2 + this.getXSimOffset(d.origItem.data[this.XKeyProperty]))

    this.rectEle1
      .transition()
      .duration(transitionDuration).attr("x", (d, i) => this.zoomedX(this.IsTimeScale ? d.data[this.XKeyProperty] : i) + this.bar1Offset + this.getXSimOffset(d.data[this.XKeyProperty]))
    this.rectEle2
      .transition()
      .duration(transitionDuration).attr("x", (d, i) => this.zoomedX(this.IsTimeScale ? d.data[this.XKeyProperty] : i) + this.bar2Offset + this.getXSimOffset(d.data[this.XKeyProperty]))
 
    if (this.GlidePaths) {
      this.glideLines
        .style("display", undefined)
        .attr("x1", (d, i) => this.zoomedX(d.StartItem[this.XKeyProperty]))
        .attr("y1", d => this.zoomedY(_.sumBy(this.DataSegmentProperties, prop => d.StartItem[prop])))
        .attr("x2", (d, i) => this.zoomedX(d.EndDate))
        .attr("y2", this.y(0));
    }
    if (this.GlidePaths && (this.isSmartAxisOn || !this.ShowGlidePaths)) {
      this.glideLines
        .style("display","none");
    }
  }

  stopSims() {
    this.axisSim.stop();
    this.labelSim.stop();
    this.labelSim2.stop();
  }

  resetChart() {
    if (this.axisSim) {
      this.axisSim.stop();
      this.initializeXData();
    }
    if (this.labelSim) {
      this.labelSim.stop();
      this.labelSim2.stop();
      this.resetTextData();
    }

    this.zoomPane.call(this.zoom.transform, d3.zoomIdentity);

    this.isSmartLabelsOn = false;
    this.isSmartAxisOn = false;

    this.simUpdate(true);
    //   this.initStackedChart();
  }
}

export class GlidePath {
  StartItem: any;
  EndDate: Date;
  Stroke: string;
}