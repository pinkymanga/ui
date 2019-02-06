import { Component, OnInit, Input } from '@angular/core';
import { Chart } from "chart.js";
import { DashboardBeanService } from "@services/dashboard/dashboard-bean.service";
import { ExpensesMainData } from '@app/interfaces/dashboard/dataExpensesComponent.interface';
import { isNullOrUndefined } from 'util';
import { MonthChartEvent } from '@app/interfaces/dashboard/monthChartEvent.interface';
import { StackedBar } from '@app/interfaces/dashboard/dashboardStackedBar.interface';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {

  stackedBarData:StackedBar[] = [];
  doughnutChart:Chart;
  expensesData:ExpensesMainData[] = [];

  totalAmount:number = 0;
  titleMonth:string = "";
  titleYear:string = "";
  assetsUrl:string = "../../../assets/media/img/categories/color";
 

  constructor( private dashboardBean:DashboardBeanService ) {
   }

  ngOnInit() {
    this.getStackedBarData();
    this.getMainData();
    this.setMainMessage( this.stackedBarData[0].labels.length - 1 );
    this.setTitles( this.stackedBarData[0].labels.length - 1 );
    this.firstData();
  }

  firstData(){
    this.pieChartOptions(0);
  }

  pieChartOptions( index:number ){
    console.log( this.expensesData[index].firstScreen.labels );

    let pieChart = document.querySelector("#expensesPieChart");
    this.doughnutChart = new Chart(pieChart, {
      type: 'doughnut',
      data:{
        labels:this.expensesData[index].firstScreen.labels,
        datasets:[{
          data: this.expensesData[index].firstScreen.totalAmount,
          backgroundColor:this.expensesData[index].firstScreen.backgroundColor
        }],
      },
      options: {
        responsive: true,
        animation:{
          animateScale : false
        },
        legend: { display: false },
      }
    });
  }

   // EVENTO DE CLICK
   selectedMonthChart( event:MonthChartEvent ){
    this.setMainMessage( event.index );
    this.setTitles( event.index );
    this.doughnutChart.destroy();
    
    this.pieChartOptions( event.index );
  }

  setTitles( index:number ){
    this.titleMonth = this.stackedBarData[0].labels[index];
    this.titleYear = this.stackedBarData[0].year[index].toString();

    let titleOfThePage = document.querySelector(".brand-logo");
    titleOfThePage.innerHTML = "Resumen "+ this.titleMonth + " "+ this.titleYear;
  }

  setMainMessage( index ){
    this.totalAmount = this.stackedBarData[0].expenses[index];
  }

  getStackedBarData(){
    this.stackedBarData = this.dashboardBean.getDataStackedBar();
  }

  getMainData(){
    this.expensesData = this.dashboardBean.getDataExpensesTab();
    console.log( this.expensesData );
  }

  dataForExpensesBarChart():number[] {
    return this.stackedBarData[0].expenses;
  }

  labelsForExpensesChart():string[] {
    return this.stackedBarData[0].labels;
  }

  sortJSON(data, key, orden) {
    return data.sort( (a, b) => {
        let x = a[key],
        y = b[key];

        if (orden === 'asc') {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }

        if (orden === 'desc') {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
  }

}
