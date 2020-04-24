import {
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from "@angular/core";
import * as d3 from "d3";
import * as DateFns from "date-fns";
import * as _ from "lodash";
import { StackedComponent, GlidePath } from "./charts/stacked.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = "D3 Sandbox";
  tabIndex = 1;

   BarChartThemeSet =  [
     { Name: 'Theme1', Code: 0, Colors: ["#063165", "#0E53A7", "#072FD1", "#5383BD", "#FF7A00", "#C55E00", "#9B4A00", "#FF6F63", "#9B0B00", "#FF1300"] },
     { Name: 'Theme2', Code: 1, Colors: ["#8EC441", "#1B9DDE", "#F59700", "#D4DF32", "#339933", "#00ABA9", "#DC5B20", "#E8BC34", "#3399FF", "#014358"] },
     { Name: 'Theme3', Code: 2, Colors: ["#0045B8", "#0058EB", "#3B7FF0", "#ADC9F9", "#D69D23", "#DDAF4B", "#ECD299", "#CC3D30", "#D45B50", "#ECB6B1"] },
     { Name: 'Theme4', Code: 3, Colors: ["#0070BF", "#0070BF", "#0070BF", "#0070BF", "#0070BF", "#0070BF", "#0070BF", "#0070BF", "#0070BF", "#0070BF"] },
     { Name: 'Theme5', Code: 4, Colors: ["#E86C0E", "#E86C0E", "#E86C0E", "#E86C0E", "#E86C0E", "#E86C0E", "#E86C0E", "#E86C0E", "#E86C0E", "#E86C0E"] },
     { Name: 'Theme6', Code: 5, Colors: ["#008037", "#008037", "#008037", "#008037", "#008037", "#008037", "#008037", "#008037", "#008037", "#008037"] }
  ]; 
  
  BarChartThemeSet2 = [
    { Name: 'Theme1', Code: 0, Colors: ["#c15147", "#c4d6a0", "#799440"] },
    { Name: 'Theme2', Code: 1, Colors: ["#ADC9F9", "#3B7FF0", "#063165"] },
    { Name: 'Theme3', Code: 2, Colors: ["#CAEBF2", "#A9A9A9", "#FF3B3F"] },
    { Name: 'Theme4', Code: 3, Colors: ["#565656", "#76323F", "#C09F80"] },
    { Name: 'Theme5', Code: 4, Colors: ["#94618E", "#49274A", "#F4DECB"] },
    { Name: 'Theme6', Code: 5, Colors: ["#945D60", "#626E60", "#AF473C"] }
  ];

  Data = [
    { name: "X", date: new Date(), seg1: 1, seg2: .06, seg3: .08, seg4: .3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2, seg10: .5 },
    { name: "Y", date: DateFns.addDays(new Date(), 1), seg1: 1, seg2: .1, seg3: .06, seg4: .3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2, seg10: .5 },
    { name: "A", date: DateFns.addDays(new Date(), 2), seg1: 1, seg2: .1, seg3: .06, seg4: .3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2, seg10: .5 },
    { name: "C", date: DateFns.addDays(new Date(), 3), seg1: 1, seg2: .1, seg3: .06, seg4: .3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2, seg10: .5 },
    { name: "B", date: DateFns.addDays(new Date(), 4), seg1: 1, seg2: .1, seg3: .06, seg4: .3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2, seg10: .5 },
    { name: "Z", date: DateFns.addMonths(new Date(), 2), seg1: 1, seg2: 1, seg3: 2, seg4: 3, seg5: .2, seg6: .1, seg7: .2, seg8: .1, seg9: 2, seg10: .5 }
  ];

  GlidePaths: GlidePath[] = [
    {
      StartItem: this.Data[5],
      EndDate: DateFns.addDays(new Date(),75),
      Stroke: "#f000ff",
    },
    {
      StartItem: this.Data[4],
      EndDate: DateFns.addDays(new Date(), 70),
      Stroke: "red",
    }
  ];

  ShowGlidePaths = true;

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
