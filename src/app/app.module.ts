import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { StackedComponent } from "./charts/stacked.component";
import { BarChartComponent } from "./charts/bar-chart.component";

@NgModule({
  declarations: [AppComponent, BarChartComponent, StackedComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
