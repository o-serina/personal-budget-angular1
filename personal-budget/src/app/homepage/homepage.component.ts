import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit{

  constructor(private http: HttpClient) {

  }

  createChart() {
    const ctx = <HTMLCanvasElement>document.getElementById('myChart');
    var myPieChart = new Chart(ctx, {
      type: 'pie',
      data: this.dataSource,
    });
  }

}
