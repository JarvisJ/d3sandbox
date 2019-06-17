import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewChild
} from "@angular/core";
import * as d3 from "d3";
import * as DateFns from "date-fns";
import * as _ from "lodash";

@Component({
  selector: "jj-stacked-chart",
  templateUrl: "./stacked.html",
  // styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackedComponent {
  title = "D3 Sandbox";
  tabIndex = 1;

  @ViewChild("gEle") gElement;
  @Input() Margin = 100;
  @Input() Height = 500;
  @Input() Width = 500;
  @Input() Data = [
    { date: new Date(), seg1: 1, seg2: 2, seg3: 3 },
    { date: DateFns.addMonths(new Date(), 2), seg1: 1, seg2: 1, seg3: 2 }
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
    var keys = ["seg1", "seg2", "seg3"];

    var x = d3
      .scaleTime()
      .rangeRound([0, 500])
      .domain([DateFns.addDays(minDate, -5), DateFns.addDays(maxDate, 5)]);

    var y = d3
      .scaleLinear()
      .range([500, 0])
      .domain([0, d3.max(this.Data, d => _.sumBy(keys, k => d[k]))]);

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

    var series = d3.stack().keys(keys)(this.Data as any);

    let color = d3
      .scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(
        d3
          .quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), series.length)
          .reverse()
      )
      .unknown("#ccc");

    let color2 = d3
      .scaleOrdinal()
      .domain(series.map(d => d.key))
      .range(
        d3
          .quantize(t => d3.interpolateSpectral(t * 0.5 + 0.1), series.length)
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

    d3G
      .append("g")
      .selectAll("g")
      .data(series)
      .join("g")
      .attr("fill", d => color(d.key) as any)
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", (d, i) => x(d.data.date) - 15)
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", 30); // x.bandwidth());

    d3G
      .append("g")
      .selectAll("g")
      .data(series)
      .join("g")
      .attr("fill", d => color2(d.key) as any)
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("x", (d, i) => x(d.data.date) + 15)
      .attr("y", d => y(d[1] * 0.5))
      .attr("height", d => y(d[0] * 0.5) - y(d[1] * 0.5))
      .attr("width", 10);

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

  showChart() {
    this.drawStackedChart();
  }
}
