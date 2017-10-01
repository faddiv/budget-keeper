import { Component, OnInit } from '@angular/core';
import { Transaction, TrasactionsService } from 'walletApi';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  transactions: Transaction[];
  changedItems: Transaction[] = [];

  constructor(
    private trasactionsService: TrasactionsService
  ) { }

  ngOnInit() {
    this.trasactionsService.fetch({
      sorting: "createdAt desc, transactionId desc"
    }).subscribe(transactions => {
      this.transactions = transactions;
    })
  }

  save() {
    this.trasactionsService.batchUpdate(this.changedItems)
      .subscribe(result => {
        this.changedItems.length = 0;
      });
  }

}
