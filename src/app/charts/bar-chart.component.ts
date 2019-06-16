import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewChild
} from "@angular/core";
import * as d3 from "d3";
import * as _ from "lodash";

@Component({
  selector: "jj-bar-chart",
  templateUrl: "./bar-chart.html",
  // styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarChartComponent {
  title = "D3 Sandbox";
  tabIndex = 1;

  @ViewChild("gEle") gElement;
  @Input() Margin = 50;

  ngOnInit() {
    this.draw();
  }

  draw() {
    var d3G = d3
      .select(this.gElement.nativeElement)
      .attr("transform", `translate(${this.Margin},${this.Margin})`);
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
}
