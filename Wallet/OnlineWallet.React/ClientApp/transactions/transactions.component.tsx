import * as React from 'react';
import { TransactionTable, directionColoringFunction } from "../common/transactions-view/"
import { Transaction, transactionService } from 'walletApi';

export namespace Transactions {
    export interface Props {

    }

    export interface State {
        changedItems: Transaction[];
        items: Transaction[];
    }
}

export class Transactions extends React.Component<Transactions.Props, Transactions.State> {

    constructor(props) {
        super(props);
        this.state = {
            changedItems: [],
            items: []
        };
        this.save = this.save.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.update = this.update.bind(this);
    }

    componentDidMount() {
        transactionService.fetch()
            .then(transactions => {
                this.setState({
                    items: transactions
                });
            });
    }

    private save() {

    }

    private deleteItem(item: Transaction) {
        console.log("deleteItem", item);
        alert("deleteItem");
    }

    private update(items: Transaction[], changedItems: Transaction[]): void {
        this.setState({
            items: items,
            changedItems: changedItems
        });
    }

    render() {
        return (
            <div>
                <form className="form-inline">
                    <button type="button" className="btn btn-success" onClick={this.save} name="saveBtn">Save</button>
                    <div className="input-group pull-right">

                    </div>
                </form>
                <TransactionTable changedItems={this.state.changedItems}
                    items={this.state.items} rowModifier={directionColoringFunction}
                    deleted={this.deleteItem} update={this.update} />
            </div>
        );
    }
}