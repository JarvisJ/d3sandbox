import { Component, ViewChild } from "@angular/core";
import * as d3 from "d3";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "D3 Sandbox";

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

    var rects = d3G.selectAll("rect");

    d3G
      .append("g")
      .attr("transform", "translate(0,500)")
      .call(xAxis);

    d3G
      .append("g")
      .attr("transform", "translate(500,0)")
      .call(yAxis);

    rects
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

    var rects = d3G.selectAll("rect");

    d3G
      .append("g")
      .attr("transform", "translate(0,500)")
      .call(xAxis);

    d3G
      .append("g")
      .attr("transform", "translate(500,0)")
      .call(yAxis);

    rects
      .data(testData)
      .join("rect")
      .attr("x", (d, i) => x(i + ""))
      .attr("y", (d, i) => y(d))
      .attr("width", x.bandwidth())
      .attr("height", d => 500 - y(d))
      .style("fill", "green");
  }

  showChart(showRegular) {
    if (showRegular) {
      this.drawRegularChart();
    } else {
      this.drawStackedChart();
    }
  }
}
