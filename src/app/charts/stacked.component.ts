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

  ngOnInit() {
    this.drawStackedChart();
  }

  drawStackedChart() {
    var d3G = d3
      .select(this.gElement.nativeElement)
      .attr("transform", `translate(${this.Margin},${this.Margin})`);
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

    var xAxis = d3
      .axisBottom(x)
      .tickValues(
        _(testData)
          .map(d => d.date)
          .uniq()
          .value()
      )
      .tickFormat(d3.timeFormat("%c"));
    var yAxis = d3.axisRight(y);

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
      .selectAll("rect")
      .data(testData)
      .join("rect")
      .attr("x", (d, i) => x(d.date) - 20)
      .attr("y", (d, i) => y(_.sum(d.values)))
      .attr("width", 30)
      .attr("height", d => 500 - y(_.sum(d.values)))
      .style("fill", "green");
  }

  showChart() {
    this.drawStackedChart();
  }
}
