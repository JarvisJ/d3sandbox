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

  constructor(public changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    // this.changeDetector.detectChanges();
  }

  showChart(showRegular) {
    if (showRegular) {
      this.tabIndex = 1;
    } else {
      this.tabIndex = 2;
      //    this.stackedChart.drawStackedChart();
    }
    //  this.changeDetector.detectChanges();
  }
}
