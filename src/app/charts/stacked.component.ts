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
  @Input() Height = 500;
  @Input() Width = 500;
  @Input() Data = [
    { date: new Date(), seg1: 1, seg2: .01, seg3: .02, seg4: .3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2 },
    { date: DateFns.addDays(new Date(), 1), seg1: 1, seg2: .01, seg3: .02, seg4: .3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2 },
    { date: DateFns.addMonths(new Date(), 2), seg1: 1, seg2: 1, seg3: 2, seg4: 3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2 }
  ];

  bar1Offset = -15;
  bar2Offset = 15;
  textOffset = -30;
  barWidth = 30;
  xAxis;
  timeFormat;

  dateData;
  textEl;
  lineEl;
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


  ngOnInit() {
    this.initStackedChart();
  }

  initStackedChart() {
    var d3G = d3
      .select(this.gElement.nativeElement)
      .attr("transform", `translate(${this.Margin},${this.Margin})`);
    d3G.selectAll("g").remove();

    var minDate = DateFns.min(..._.map(this.Data, d => d.date));
    var maxDate = DateFns.max(..._.map(this.Data, d => d.date));
    var keys = ["seg1", "seg2", "seg3", "seg4", "seg5", "seg6", "seg7", "seg8", "seg9"];

    this.x = d3
      .scaleTime()
      .rangeRound([0, 500])
      .domain([DateFns.addDays(minDate, -5), DateFns.addDays(maxDate, 5)]);

    this.y = d3
      .scaleLinear()
      .range([500, 0])
      .domain([0, d3.max(this.Data, d => _.sumBy(keys, k => d[k] || 0))]);


    this.timeFormat = d3.timeFormat("%c");
    this.xAxis = d3
      .axisBottom(this.x)
      .tickValues(
        _(this.Data)
          .map(d => d.date)
          .value()
      )
      .tickFormat(d => this.timeFormat(d));
    var yAxis = d3.axisRight(this.y);

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

    this.xAxisElement = d3G
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0,500)");

    this.xAxisElement.call(this.xAxis)
      .selectAll("text")
      .attr("y", 10)
      .attr("x", 5)
      //   .attr("dy", ".35em")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");

    d3G
      .append("g")
      .attr("transform", "translate(500,0)")
      .call(yAxis);


    this.rectEle1 = d3G
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

    this.rectEle2 = d3G
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
      .attr("width", 10);



    // this.smartLabelForceLayout(d3G, x, y, color);
    this.initializeTextData();

    this.textEl = d3G.append("g")
      .selectAll("g")
      .data(this.textData)
      .join("text")
      .attr("fill", d => this.color(d.key) as any)
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .text((d, i) => _.round(d.value, 2))
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle");

    this.lineEl = d3G.append("g")
      .selectAll("g")
      .data(this.textData)
      .join("line")
      .style("stroke", d => this.color(d.key) as any)
      .attr("x1", (d, i) => d.x)
      .attr("y1", d => d.y)
      .attr("x2", (d, i) => d.x - this.textOffset)
      .attr("y2", d => d.y)
      .text((d, i) => _.round(d.value, 2))
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle");

    // this.smartLabelForceLayout(textData, textEl, lineEl);

    this.initializeDateData();
    //  this.smartAxisForceLayout(dateData, textEl, lineEl, rectEle1, rectEle2,xAxisElement,x);


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
  }

  resetTextData() {
    _.each(this.textData, d => {
      d.x = this.x(d.date) + this.textOffset - this.barWidth / 2;
      d.y = this.y(d.origItem[1] - (d.origItem[1] - d.origItem[0]) / 2);
    });
  }
 
  labelSim;
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

    // slowSim();
    // var i = 0;
    // function slowSim() {
    //   i++;
    //   if (i > 1000) return;
    //   console.log(i);
    //   setTimeout(() => {
    //     sim.tick();
    //     onTick();
    //     slowSim();
    //   }, 300);
    //}
  }

  updateChart() {

  }

  xOffsetByDate;
  smartAxisForceLayout() {
    this.axisSim = d3.forceSimulation(this.dateData)
      //.force('charge', d3.forceManyBody().strength(1))
      .force('y', d3.forceY().y(function (d) {
        return d.y
      }))
      .force('collision', d3.forceCollide().radius(function (d) {
        return 40;
      }))
      .on('tick', this.simUpdate.bind(this));
  }

  transitionDuration = 1000;
  labelSimUpdate(useTransition = false) {
    let transitionDuration = useTransition ? this.transitionDuration : 0;
    this.textEl
      .transition()
      .duration(transitionDuration)
      .attr("y", d => d.y);

    this.lineEl
      .transition()
      .duration(transitionDuration)
      .attr("y1", d => d.y);
  }

  getXSimOffset(date) {
    return this.xOffsetByDate[date].x - this.xOffsetByDate[date].origX;
  }

  simUpdate(useTransition = false) {
    //  this.xOffsetByDate = _.keyBy(this.dateData, d => d.date);
    let transitionDuration = useTransition ? this.transitionDuration : 0;
    this.xAxis = d3
      .axisBottom(this.x)
      .tickValues(
        _.map(this.Data, d => this.x.invert(this.x(d.date) + this.getXSimOffset(d.date)))
      )
      .tickFormat((d, idx) => this.timeFormat(this.Data[idx].date));

    this.xAxisElement
      .transition()
      .duration(transitionDuration)
      .call(this.xAxis)
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
      .attr("x", d => d.x + this.getXSimOffset(d.date));
    this.lineEl.transition()
      .duration(transitionDuration)
      .attr("y1", d => d.y)
      .attr("x1", (d, i) => d.x + this.getXSimOffset(d.date))
      .attr("x2", (d, i) => d.x - this.textOffset + this.getXSimOffset(d.date));
    this.rectEle1
      .transition()
      .duration(transitionDuration).attr("x", (d, i) => this.x(d.data.date) + this.bar1Offset + this.getXSimOffset(d.data.date))
    this.rectEle2
      .transition()
      .duration(transitionDuration).attr("x", (d, i) => this.x(d.data.date) + this.bar2Offset + this.getXSimOffset(d.data.date))
  }

  resetChart() {
    if (this.axisSim) {
      this.axisSim.stop();
      this.initializeDateData();
    }
    if (this.labelSim) {
      this.labelSim.stop();
      this.resetTextData();
    }
    this.simUpdate(true);

    this.isSmartLabelsOn = false;
    this.isSmartAxisOn = false;
    //   this.initStackedChart();
  }
}
