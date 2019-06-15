import { Component, ViewChild } from "@angular/core";
import * as d3 from "d3";
import * as DateFns from "date-fns";
import * as _ from "lodash";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "D3 Sandbox";
  tabIndex = 1;

  @ViewChild("g") g;
  ngAfterViewInit() {
    this.drawRegularChart();
  }
  drawRegularChart() {
    var d3G = d3.select(this.g.nativeElement);
    d3G.selectAll("g").remove();

    var testData = [1, 2, 3];

    var x = d3
      .scaleBand()
      .range([0, 500])
      .round(true)
      .paddingInner(0.1)
      .paddingOuter(0.1)
      .domain(["0", "1", "2"]);

    var y = d3
      .scaleLinear()
      .range([500, 0])
      .domain([0, d3.max(testData, d => d)]);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisRight(y);

    d3G
      .append("g")
      .attr("transform", "translate(0,500)")
      .call(xAxis);

    d3G
      .append("g")
      .attr("transform", "translate(500,0)")
      .call(yAxis);

    d3G
      .selectAll("rect")
      .data(testData)
      .join("rect")
      .attr("x", (d, i) => x(i + ""))
      .attr("y", (d, i) => y(d))
      .attr("width", x.bandwidth())
      .attr("height", d => 500 - y(d))
      .style("fill", "steelblue");
  }

  drawStackedChart() {
    var d3G = d3.select(this.g.nativeElement);
    d3G.selectAll("g").remove();

    var testData = [
      { date: new Date(), values: [1, 2, 3] },
      { date: DateFns.addMonths(new Date(), 2), values: [1, 1, 2] }
    ];

    var minDate = DateFns.min(..._.map(testData, d => d.date));
    var maxDate = DateFns.max(..._.map(testData, d => d.date));

    var x = d3
      .scaleTime()
      .rangeRound([0, 500])
      .domain([DateFns.addDays(minDate, -5), DateFns.addDays(maxDate, 5)]);

    var y = d3
      .scaleLinear()
      .range([500, 0])
      .domain([0, d3.max(testData, d => _.sum(d.values))]);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisRight(y);

    d3G
      .append("g")
      .attr("transform", "translate(0,500)")
      .call(xAxis);

    d3G
      .append("g")
      .attr("transform", "translate(500,0)")
      .call(yAxis);

    d3G
      .selectAll("rect")
      .data(testData)
      .join("rect")
      .attr("x", (d, i) => x(d.date) - 20)
      .attr("y", (d, i) => y(_.sum(d.values)))
      .attr("width", 30)
      .attr("height", d => 500 - y(_.sum(d.values)))
      .style("fill", "green");
  }

  showChart(showRegular) {
    if (showRegular) {
      this.tabIndex = 1;
      this.drawRegularChart();
    } else {
      this.tabIndex = 2;
      this.drawStackedChart();
    }
  }
}
