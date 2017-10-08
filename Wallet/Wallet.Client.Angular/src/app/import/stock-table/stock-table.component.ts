import { Component, OnInit, Input } from '@angular/core';
import { StockModel } from './StockModel';

@Component({
  selector: 'app-stock-table',
  templateUrl: './stock-table.component.html',
  styleUrls: ['./stock-table.component.scss']
})
export class StockTableComponent implements OnInit {

  @Input()
  stocks: StockModel[];

  constructor() { }

  ngOnInit() {
  }

}