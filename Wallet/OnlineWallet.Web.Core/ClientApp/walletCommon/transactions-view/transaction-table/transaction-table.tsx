import * as React from "react";
import { Wallet, Transaction, walletService } from "walletApi";
import { TransactionTableRow } from "./transaction-table-row";
import { TransactionViewModel, ITransactionTableExtFunction } from "walletCommon";
import { bind, _ } from "helpers";
import { isClickableClicked } from "react-ext";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { TransactionSummaryActions } from "actions/transactionsSummary";
import { RootState } from "reducers";

enum SelectMode {
    deselect,
    none,
    select
}

export namespace TransactionTable {
    export interface Props {
        actions?: typeof TransactionSummaryActions;
        items: TransactionViewModel[];
        wallets: Wallet[];
        changedItems?: TransactionViewModel[];
        rowColor?: ITransactionTableExtFunction;
        transactionSummary?: TransactionViewModel[];
        update(items: TransactionViewModel[], changedItems?: TransactionViewModel[]): void;
        deleted(items: TransactionViewModel): void;
    }

    export interface State {
        selectMode: SelectMode;
    }
}

@connect(mapStateToProps, mapDispatchToProps)
export class TransactionTable extends React.Component<TransactionTable.Props, TransactionTable.State> {

    constructor(props: TransactionTable.Props) {
        super(props);
        this.state = {
            selectMode: SelectMode.none
        };
    }

    @bind
    saveTransaction(newItem: TransactionViewModel, original: TransactionViewModel) {
        const items = _.replace(this.props.items, newItem, original);
        const changes = this.props.changedItems ? _.replace(this.props.changedItems, newItem, original, true) : undefined;
        this.props.update(items, changes);
    }

    @bind
    deleteTransaction(item: TransactionViewModel) {
        this.props.deleted(item);
    }

    @bind
    startSelection(item: TransactionViewModel) {
        this.setState((prevState: TransactionTable.State, props: TransactionTable.Props) => {
            const selectMode = _.contains(props.transactionSummary, item)
                ? SelectMode.deselect
                : SelectMode.select;
            const selected = selectMode === SelectMode.select
                ? [...props.transactionSummary, item]
                : _.remove(props.transactionSummary, item);
            props.actions.transactionsSelected(selected);
            return {
                selectMode,
                selected
            };
        });
    }

    @bind
    selectingRow(item: TransactionViewModel) {
        if (this.state.selectMode === SelectMode.none) { return; }
        let selected: TransactionViewModel[];
        if (this.state.selectMode === SelectMode.select) {
            if (!_.contains(this.props.transactionSummary, item)) {
                selected = [...this.props.transactionSummary, item];
            }
        } else {
            if (_.contains(this.props.transactionSummary, item)) {
                selected = _.remove(this.props.transactionSummary, item);
            }
        }
        if (selected) {
            this.props.actions.transactionsSelected(selected);
        }
    }

    @bind
    endSelection() {
        this.setState((prevState, props) => {
            return {
                selectMode: SelectMode.none
            };
        });
    }

    render() {
        const { items, wallets, rowColor, transactionSummary } = this.props;
        return (
            <table className="table transactions" onMouseLeave={this.endSelection}>
                <thead>
                    <tr>
                        <th className="created-at">createdAt</th>
                        <th className="name">name</th>
                        <th className="direction">dir</th>
                        <th className="price">price</th>
                        <th className="wallet-name">walletName</th>
                        <th className="category">category</th>
                        <th>comment</th>
                        <th className="commands"></th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item =>
                        <TransactionTableRow
                            key={item.key}
                            item={item}
                            selected={_.contains(transactionSummary, item)}
                            wallets={wallets}
                            deleteTransaction={this.deleteTransaction}
                            saveTransaction={this.saveTransaction}
                            rowColor={rowColor}
                            rowMouseDown={this.startSelection}
                            rowMouseEnter={this.selectingRow}
                            rowMouseUp={this.endSelection} />)}
                </tbody>
            </table>
        );
    }
}

function mapStateToProps(state: RootState, ownProps: any) {
    return {
        transactionSummary: state.transactionSummary
    };
}

function mapDispatchToProps(dispatch, ownProps: any) {
    return {
        actions: bindActionCreators(TransactionSummaryActions as any, dispatch) as typeof TransactionSummaryActions
    };
}
