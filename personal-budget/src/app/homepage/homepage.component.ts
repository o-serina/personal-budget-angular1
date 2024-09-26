import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../data.service';

import Chart from 'chart.js/auto';

import * as d3 from 'd3';

interface DataItem {
  title: string;
  budget: number;
}

interface PieArcDatum extends d3.PieArcDatum<DataItem> {}

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  public dataSource: any = {
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#EB9987',
          '#D8FD8A',
          '#8AFDDC',
          '#8AA8FD',
          '#83FF33',
          '#F633FF',
          '#8AC4FD',
          '#DF8AFD',
        ],
      },
    ],
    labels: [],
  };

  public newDataSource: any = [];

  private svg: any;
  private width = 650;
  private height = 300;
  // The radius of the pie chart is half the smallest side
  private radius = Math.min(this.width, this.height) / 2;
  private colors: any;

  constructor(private dataService: DataService) {}
  private createColors(): void {
    const titles = this.dataSource.labels;

    this.colors = d3
      .scaleOrdinal()
      .domain(titles)
      .range([
        '#FD8A8A',
        '#ff6384',
        '#36a2eb',
        '#fd6b19',
        '#F4FD8A',
        '#8AFDA8',
        '#FF3333',
        '#CA8AFD',
      ]);
  }
  private createSvg(): void {
    this.width = 800; // Total width of the SVG
    this.height = 500; // Total height of the SVG
    this.radius = Math.min(this.width, this.height) / 2 * 0.9; // Adjusted to use 90% of half the smallest dimension

    this.svg = d3.select('#pie-chart')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`) // Ensures responsive scaling
      .append('g')
      .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);
  }

  private drawChart(): void {
    const pie = d3.pie<DataItem>().value((d: DataItem) => d.budget);
    const arc = d3.arc<PieArcDatum>().innerRadius(0).outerRadius(this.radius);

    // Draw arcs
    this.svg.selectAll('path')
      .data(pie(this.newDataSource))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any, i: any) => this.colors(i))
      .attr('stroke', 'white')
      .style('stroke-width', '2px');

    // Define outer arc for polyline and labels
    const outerArc = d3.arc<PieArcDatum>().innerRadius(this.radius * 0.9).outerRadius(this.radius * 0.9);

    // Add polylines
    this.svg.selectAll('polyline')
      .data(pie(this.newDataSource))
      .enter()
      .append('polyline')
      .attr('points', (d: PieArcDatum) => {
        const posA = arc.centroid(d); // line insertion in the slice
        const posB = outerArc.centroid(d); // label position
        const posC = outerArc.centroid(d); // a little further for label
        posC[0] = this.radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      })
      .style('fill', 'none')
      .attr('stroke', 'black')
      .style('stroke-width', 1);

    // Add labels
    this.svg.selectAll('text')
      .data(pie(this.newDataSource))
      .enter()
      .append('text')
      .text((d: { data: { title: any; }; }) => d.data.title)
      .attr('transform', (d: PieArcDatum) => {
        const pos = outerArc.centroid(d);
        pos[0] = this.radius * (midAngle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style('text-anchor', (d: PieArcDatum) => midAngle(d) < Math.PI ? 'start' : 'end')
      .style('font-size', '12px');

    // Calculate middle angle to decide label alignment
    function midAngle(d: PieArcDatum): number {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
  }
  createChart() {
    const ctx = <HTMLCanvasElement>document.getElementById('myChart');
    const myPieChart = new Chart(ctx, {
      type: 'pie',
      data: this.dataSource,
      options: {
        responsive: true,      // Ensure the chart is responsive
        maintainAspectRatio: false // This prevents the chart from distorting
      }
    });
  }

  ngOnInit(): void {
    if (
      this.dataSource.datasets[0].data.length == 0 ||
      this.newDataSource.length == 0
    ) {
      this.dataService.fetchDataFromBackend().subscribe((res: any) => {
        for (var i = 0; i < res.myBudget.length; i++) {
          this.dataSource.datasets[0].data[i] = res.myBudget[i].budget;
          this.dataSource.labels[i] = res.myBudget[i].title;

          this.newDataSource.push({
            title: res.myBudget[i].title,
            budget: res.myBudget[i].budget,
          });
        }
        this.dataService.setDataSource(this.dataSource);
        this.dataService.setNewDataSource(this.newDataSource);

        // console.log(this.dataService.getDataSource());
        this.createChart();
        this.createSvg();
        this.createColors();
        this.drawChart();
      });
    }
  }
}
