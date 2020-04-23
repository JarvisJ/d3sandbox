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
    { date: DateFns.addDays(new Date(),1), seg1: 1, seg2: .01, seg3: .02, seg4: .3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9:2 },
    { date: DateFns.addMonths(new Date(), 2), seg1: 1, seg2: 1, seg3: 2, seg4: 3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2  }
  ];

  bar1Offset = -15;
  bar2Offset = 15;
  textOffset = -30;
  barWidth = 30;
  xAxis;
  timeFormat;

  ngOnInit() {
    this.drawStackedChart();
  }

  drawStackedChart() {
    var d3G = d3
      .select(this.gElement.nativeElement)
      .attr("transform", `translate(${this.Margin},${this.Margin})`);
    d3G.selectAll("g").remove();

    var minDate = DateFns.min(..._.map(this.Data, d => d.date));
    var maxDate = DateFns.max(..._.map(this.Data, d => d.date));
    var keys = ["seg1", "seg2", "seg3", "seg4", "seg5", "seg6", "seg7", "seg8", "seg9"];

    var x = d3
      .scaleTime()
      .rangeRound([0, 500])
      .domain([DateFns.addDays(minDate, -5), DateFns.addDays(maxDate, 5)]);
 
    var y = d3
      .scaleLinear()
      .range([500, 0])
      .domain([0, d3.max(this.Data, d => _.sumBy(keys, k => d[k] || 0))]);

    
    this.timeFormat = d3.timeFormat("%c");
    this.xAxis = d3
      .axisBottom(x)
      .tickValues(
        _(this.Data)
          .map(d => d.date) 
          .value()
      )
      .tickFormat(d =>  this.timeFormat(d)); 
    var yAxis = d3.axisRight(y);

    this.series = d3.stack().keys(keys)(this.Data as any);

    let color = d3
      .scaleOrdinal()
      .domain(this.series.map(d => d.key))
      .range(
        d3
          .quantize(t => d3.interpolateRainbow(t * 0.8 + 0.3), this.series.length)
          .reverse()
      )
      .unknown("#ccc");

    let color2 = d3
      .scaleOrdinal()
      .domain(this.series.map(d => d.key))
      .range(
        d3
          .quantize(t => d3.interpolateSpectral(t * 0.5 + 0.1), this.series.length)
          .reverse()
      )
      .unknown("#ccc");

    var xAxisElement = d3G
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0,500)");
    
    xAxisElement.call(this.xAxis)
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


    var rectEle1 = d3G
      .append("g")
      .selectAll("g")
      .data(this.series)
      .join("g")
      .attr("fill", d => color(d.key) as any)
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", (d, i) => x(d.data.date) + this.bar1Offset)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", this.barWidth); // x.bandwidth());

    var rectEle2 = d3G
      .append("g")
      .selectAll("g")
      .data(this.series)
      .join("g")
      .attr("fill", d => color2(d.key) as any)
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", (d, i) => x(d.data.date) + this.bar2Offset)
      .attr("y", d => y(d[1] * 0.5))
      .attr("height", d => y(d[0] * 0.5) - y(d[1] * 0.5))
      .attr("width", 10);



    // this.smartLabelForceLayout(d3G, x, y, color);
    var textData = _.flatMap(this.series, d => _.map(d, dd => { return { key: d.key, x: x(dd.data.date) + this.textOffset - this.barWidth / 2, y: y(dd[1] - (dd[1] - dd[0]) / 2), value: dd[1] - dd[0], date: dd.data.date } }));

    var textEl = d3G.append("g")
      .selectAll("g")
      .data(textData)
      .join("text")
      .attr("fill", d => color(d.key) as any)
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .text((d, i) => _.round(d.value, 2))
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle");

    var lineEl = d3G.append("g")
      .selectAll("g")
      .data(textData)
      .join("line")
      .style("stroke", d => color(d.key) as any)
      .attr("x1", (d, i) => d.x)
      .attr("y1", d => d.y)
      .attr("x2", (d, i) => d.x - this.textOffset)
      .attr("y2", d => d.y)
      .text((d, i) => _.round(d.value, 2))
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle");

   // this.smartLabelForceLayout(textData, textEl, lineEl);
    
    var dateData = _.map(this.Data, d => {
      return {
        date: d.date,
        origX: x(d.date),
        x: x(d.date),
        y: 0,
      };
    }
    );

  //  this.smartAxisForceLayout(dateData, textEl, lineEl, rectEle1, rectEle2,xAxisElement,x);

    this.doSmartLabels = () => {
      this.smartLabelForceLayout(textData, textEl, lineEl);
    }

    this.doSmartAxis = () => {
      this.smartAxisForceLayout(dateData, textEl, lineEl, rectEle1, rectEle2, xAxisElement, x);
    }
    
    // .join("rect")
    // .attr("x", (d, i) => x(d.date) - 20)
    // .attr("y", (d, i) => y(_.sum(d.values)))
    // .attr("width", 30)
    // .attr("height", d => 500 - y(_.sum(d.values)))
    // .style("fill", "green");

    // d3G
    //   .append("g")
    //   .selectAll("rect")
    //   .data(this.Data)
    //   .join("rect")
    //   .attr("x", (d, i) => x(d.date) + 10)
    //   .attr("y", (d, i) => y(_.sum(d.values) * 0.5))
    //   .attr("width", 10)
    //   .attr("height", d => 500 - y(_.sum(d.values) * 0.5))
    //   .style("fill", "steelblue");
  }

  doSmartLabels;
  doSmartAxis;

  smartLabelForceLayout(textData, textEl, lineEl) {
    function onTick() {
      textEl.attr("y", d => d.y);
      lineEl.attr("y1", d => d.y);
    }

    var sim = d3.forceSimulation(textData)
      //.force('charge', d3.forceManyBody().strength(1))
      .force('x', d3.forceX().x(function (d) {
        return d.x
      }))
      .force('collision', d3.forceCollide().radius(function (d) {
        return 7;
      }))
      .on('tick', onTick);

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

  smartAxisForceLayout(yData, textEl, lineEl, rectEle1, rectEle2, xAxisElement, x) {
    var xOffsetByDate;

    function getXOffset(date) {
      return xOffsetByDate[date].x - xOffsetByDate[date].origX;
    }
 
    let onTick = () => {
      xOffsetByDate = _.keyBy(yData, d => d.date);

      
      this.xAxis = d3
        .axisBottom(x)
        .tickValues(
          _.map(this.Data, d => x.invert(x(d.date)+getXOffset(d.date)))
        )
        .tickFormat((d,idx) => this.timeFormat(this.Data[idx].date)); 

      xAxisElement.call(this.xAxis)
        .selectAll("text")
      .attr("y", 10)
      .attr("x", 5)
      //   .attr("dy", ".35em")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");

      textEl.attr("x", d => d.x + getXOffset(d.date));
      lineEl.attr("x1", (d, i) => d.x + getXOffset(d.date))
        .attr("x2", (d, i) => d.x - this.textOffset + getXOffset(d.date));
      rectEle1.attr("x", (d, i) => x(d.data.date) + this.bar1Offset + getXOffset(d.data.date))
      rectEle2.attr("x", (d, i) => x(d.data.date) + this.bar2Offset + getXOffset(d.data.date))
    };

    var sim = d3.forceSimulation(yData)
      //.force('charge', d3.forceManyBody().strength(1))
      .force('y', d3.forceY().y(function (d) {
        return d.y
      }))
      .force('collision', d3.forceCollide().radius(function (d) {
        return 40;
      }))
      .on('tick', onTick);

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

  showChart() {
    this.drawStackedChart();
  }
}
