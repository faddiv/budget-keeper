import { Component, OnInit } from '@angular/core';
import { ExportImportRow, Transaction, TrasactionsService, ApiError } from "walletApi";
import { AlertModel } from 'app/common/alerts/AlertModel';
import { ListHelpers } from 'walletCommon';
import { StockModel } from './stock-table/StockModel';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  linesToSave: Transaction[] = [];
  stocks: StockModel[];
  alerts: AlertModel[] = [];
  current: string = 'full';
  canSave = false;

  constructor(private transactionsService: TrasactionsService) {

  }

  get numRow() {
    return this.linesToSave.length;
  }
  ngOnInit() {
  }

  addLines(newItems: Array<ExportImportRow> = []) {
    this.linesToSave = newItems.map(e => <Transaction>{
      comment: e.comment,
      createdAt: e.created,
      direction: e.direction,
      name: e.name,
      transactionId: e.matchingId || 0,
      value: e.amount,
      walletId: e.source,
      category: e.category,

    });
    this.stocks = [];
    var grouping: {
      [name: string]: StockModel
    } = {};
    for (var index = 0; index < newItems.length; index++) {
      var element = newItems[index];
      if (grouping[element.name]) {
        grouping[element.name].category = grouping[element.name].category || element.category;
        grouping[element.name].count++;
      } else {
        grouping[element.name] = new StockModel(element.name, element.category, 1);
      }
    }
    for (var key in grouping) {
      if (grouping.hasOwnProperty(key)) {
        this.stocks.push(grouping[key]);
      }
    }
    this.stocks.sort((left, right) => right.count - left.count);
    this.canSave = true;
  }

  show(menu: string) {
    this.current = menu;
  }

  save() {
    if (!this.canSave) return;
    this.transactionsService.batchUpdate(this.linesToSave)
      .subscribe(() => {
        this.alerts.push(AlertModel.success("Items saved successfully"));
        this.linesToSave = [];
      }, (error: ApiError) => {
        this.alerts.push(AlertModel.error(error.message));
      })
  }

}
