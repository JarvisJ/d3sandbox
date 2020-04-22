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
    { date: new Date(), seg1: 1, seg2: .01, seg3: .02, seg4: 3, seg5: .2, seg6: .1 },
    { date: DateFns.addMonths(new Date(), 2), seg1: 1, seg2: 1, seg3: 2, seg4: 3, seg5: .2, seg6: .1 }
  ];

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
    var keys = ["seg1", "seg2", "seg3", "seg4", "seg5", "seg6"];

    var x = d3
      .scaleTime()
      .rangeRound([0, 500])
      .domain([DateFns.addDays(minDate, -5), DateFns.addDays(maxDate, 5)]);

    var y = d3
      .scaleLinear()
      .range([500, 0])
      .domain([0, d3.max(this.Data, d => _.sumBy(keys, k => d[k] || 0))]);

    var xAxis = d3
      .axisBottom(x)
      .tickValues(
        _(this.Data)
          .map(d => d.date)
          .uniq()
          .value()
      )
      .tickFormat(d3.timeFormat("%c"));
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

    d3G
      .append("g")
      .attr("transform", "translate(0,500)")
      .call(xAxis)
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

    var barWidth = 30;

    d3G
      .append("g")
      .selectAll("g")
      .data(this.series)
      .join("g")
      .attr("fill", d => color(d.key) as any)
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", (d, i) => x(d.data.date) - 15)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", barWidth); // x.bandwidth());

    d3G
      .append("g")
      .selectAll("g")
      .data(this.series)
      .join("g")
      .attr("fill", d => color2(d.key) as any)
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", (d, i) => x(d.data.date) + 15)
      .attr("y", d => y(d[1] * 0.5))
      .attr("height", d => y(d[0] * 0.5) - y(d[1] * 0.5))
      .attr("width", 10);



    // this.smartLabelForceLayout(d3G, x, y, color);
    var textOffset = 30;
    var textData = _.flatMap(this.series, d => _.map(d, dd => { return { key: d.key, x: x(dd.data.date) - textOffset - barWidth / 2, y: y(dd[1] - (dd[1] - dd[0]) / 2), value: dd[1] - dd[0] } }));

    var textEl = d3G.append("g")
      .selectAll("g")
      .data(textData)
      .join("text")
      .attr("fill", d => color(d.key) as any)
      .attr("x", (d, i) => d.x)
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
      .attr("x2", (d, i) => d.x + textOffset)
      .attr("y2", d => d.y)
      .text((d, i) => _.round(d.value, 2))
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle");

    this.smartLabelForceLayout(textEl, lineEl, textData);

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

  smartLabelForceLayout(textEl, lineEl, textData) {
    function onTick() {
      textEl.attr("x", (d, i) => d.x)
        .attr("y", d => d.y);

      lineEl.attr("x1", (d, i) => d.x)
        .attr("y1", d => d.y);
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

  showChart() {
    this.drawStackedChart();
  }
}
