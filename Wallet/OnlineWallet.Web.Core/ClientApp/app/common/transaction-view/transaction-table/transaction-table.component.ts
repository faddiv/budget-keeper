import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { TransactionViewModel, ITransactionTableExtFunction } from '../models';
import { Wallet, Transaction, WalletService, MoneyDirection } from 'walletApi';
import { ListHelpers } from 'walletCommon';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss']
})
export class TransactionTableComponent implements OnInit, OnChanges {

  wallets: Wallet[];

  pageItems: TransactionViewModel[];

  @Input("items")
  items: Transaction[];

  @Input("changedItems")
  changedItems: Transaction[];

  @Input("rowModifier")
  rowModifier: ITransactionTableExtFunction;

  @Output("deleted")
  deleted = new EventEmitter<TransactionViewModel>();

  constructor(
    private walletService: WalletService
  ) { }

  ngOnInit() {
    this.walletService.getAll().subscribe(value => {
      this.wallets = value;
      if (this.pageItems && this.pageItems.length) {
        this.pageItems.forEach(item => this.setWalletName(item));
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["items"]) {
      this.loadItems();
    }
  }

  loadItems() {
    this.pageItems = this.items ? this.items.map(v => new TransactionViewModel(v)) : [];

    this.pageItems.forEach(item => {
      this.setWalletName(item);
      if (this.rowModifier) {
        this.rowModifier(item);
      }
    });
  }

  changeDirection(item: TransactionViewModel) {
    switch (item.direction) {
      case MoneyDirection.Expense:
        item.direction = MoneyDirection.Income;
        break;
      case MoneyDirection.Income:
        item.direction = MoneyDirection.Plan;
        break;
      case MoneyDirection.Plan:
        item.direction = MoneyDirection.Expense;
        break;
    }
  }

  editTransaction(item: TransactionViewModel) {
    item.editMode = !item.editMode;
  }

  deleteTransaction(item: TransactionViewModel) {
    this.deleted.emit(item);
  }

  saveTransaction(item: TransactionViewModel) {
    for (var key in item.original) {
      if (item.original.hasOwnProperty(key)) {
        if (item.original[key] !== item[key]) {
          item.original[key] = item[key];
          item.changed = true;
        }
      }
    }
    this.setWalletName(item);
    item.editMode = false;
    if (this.changedItems) {
      var changes = this.pageItems.filter(val => val.changed);
      for (var index = 0; index < changes.length; index++) {
        var item = changes[index];
        if (this.changedItems.findIndex(e => e === item.original) === -1) {
          this.changedItems.push(item.original);
        }
      }
    }
  }
  private setWalletName(item: TransactionViewModel) {
    item.walletName = ListHelpers.selectMap<Wallet, string>(this.wallets, w => w.moneyWalletId == item.walletId, w => w.name);
  }
}