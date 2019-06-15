import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from "@angular/core";
import * as d3 from "d3";
import * as DateFns from "date-fns";
import * as _ from "lodash";
import { StackedComponent } from "./charts/stacked.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = "D3 Sandbox";
  tabIndex = 1;

  @ViewChild("gEle") g;
  @ViewChild("stackedChart") stackedChart: StackedComponent;

  constructor(public changeDetector: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.drawRegularChart();
    this.changeDetector.detectChanges();
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
      .append("g")
      .selectAll("rect")
      .data(testData)
      .join("rect")
      .attr("x", (d, i) => x(i + ""))
      .attr("y", (d, i) => y(d))
      .attr("width", x.bandwidth())
      .attr("height", d => 500 - y(d))
      .style("fill", "steelblue");
  }

  showChart(showRegular) {
    if (showRegular) {
      this.tabIndex = 1;
      this.drawRegularChart();
    } else {
      this.tabIndex = 2;
      this.stackedChart.drawStackedChart();
    }
    this.changeDetector.detectChanges();
  }
}
