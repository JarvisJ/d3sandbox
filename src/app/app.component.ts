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
    var d3G = d3.select(this.g.nativeElement);
    var testData = [1, 2, 3];

    var x = d3
      .scaleOrdinal()
      .range([0, 500])
      .domain(["0", "1", "2"]);

    var y = d3
      .scaleLinear()
      .range([500, 0])
      .domain([0, d3.max(testData, d => d)]);

    var rects = d3G.selectAll("rect");

    rects
      .data(testData)
      .enter()
      .append("rect")
      .merge(rects)
      .attr("width", d => d * 20)
      .attr("height", 20)
      .style("fill", "blue")
      .attr("transform", (d, i) => `translate(10,${i * 30})`);
  }
}
