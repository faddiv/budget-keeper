import * as React from 'react';
import { ArticleModel, articleService } from 'walletApi';
import { bind, className as cssName } from 'walletCommon';

export namespace NameInput {
    export interface Props {
        value: string;
        onChange?: (value: React.SyntheticEvent<HTMLInputElement>) => void;
        autoFocus?: boolean;
        onSelect?: (selected: ArticleModel) => void;
        className?: string;
    }
    export interface State {
        items: ArticleModel[];
        open: boolean;
        focused: boolean;
        active?: ArticleModel;
        value: string;
    }
}

export class NameInput extends React.Component<NameInput.Props, NameInput.State> {
    nameInput: HTMLInputElement;

    constructor(props) {
        super(props);
        this.state = {
            items: [],
            open: false,
            focused: false,
            value: props.value
        };
    }

    componentDidMount() {
        window.addEventListener("click", this.globalClick, false);
        window.addEventListener("focus", this.globalFocus, true);
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.globalClick, false);
        window.removeEventListener("focus", this.globalFocus, true);
    }

    componentWillReceiveProps(nextProps: Readonly<NameInput.Props>, nextContext: any) {
        this.setState({
            value: nextProps.value
        });
    }

    @bind
    private globalClick(event: MouseEvent) {
        if (!this.state.focused) {
            this.close();
        }
    }

    @bind
    private globalFocus(event: FocusEvent) {
        if (!this.state.focused && this.state.open) {
            this.close();
        }
    }

    private close(state?: Partial<NameInput.State>) {
        this.setState({
            open: false,
            active: null,
            ...state as any
        });
    }

    private open(state?: Partial<NameInput.State>) {
        let active = this.state.active || this.state.items[0];
        if (state && state.items) {
            active = state.items[0];
        }
        this.setState({
            open: true,
            active: active,
            focused: true,
            ...state as any
        });
    }

    focus() {
        this.nameInput && this.nameInput.focus();
    }

    @bind
    private async onChange(event: React.SyntheticEvent<HTMLInputElement>) {
        var value = getInputValue(event);
        this.setValue(value);
        if (canOpen(value)) {
            const items = await articleService.filterBy(value);
            if (items.length > 0) {
                this.open({
                    items
                });
            } else {
                this.close({
                    items: []
                });
            }
        } else {
            this.close({
                items: []
            });
        }
        if (this.props.onChange) {
            this.props.onChange(event);
        }
    }

    private select(item: ArticleModel) {
        this.setValue(this.getItemValue(item), {
            items: [item]
        }, () => {
            if (this.props.onSelect) {
                this.props.onSelect(item);
            }
        });
    }

    private setValue(value: string, state?: Partial<NameInput.State>, callback?: () => void) {
        this.setState({
            value,
            ...state as any
        }, callback);
    }

    @bind
    private onBlur(event: React.SyntheticEvent<HTMLInputElement>) {
        var value = getInputValue(event);
        this.setState({
            focused: false
        });
    }

    @bind
    private onFocus(event: React.SyntheticEvent<HTMLInputElement>) {
        const open = canOpen(this.state.value) && this.hasSelectable();
        if (open) {
            this.open();
        } else {
            this.close();
        }
    }

    private onlyItemActive() {
        return this.state.items.length === 1
            && this.state.items[0] === this.state.active;
    }

    private navigate(direction: number) {
        let ok = false;
        if (this.state.open) {
            var index = this.state.items.indexOf(this.state.active) + direction;
            if (0 <= index && index < this.state.items.length) {
                this.setState({
                    active: this.state.items[index]
                });
            }
            ok = true;
        } else {
            if (canOpen(this.state.value) && this.hasSelectable()) {
                this.open();
                ok = true;
            }
        }
        return ok;
    }
    @bind
    private onKeyEvent(event: React.KeyboardEvent<HTMLInputElement>) {
        switch (event.key) {
            case "ArrowUp":
                if (this.navigate(-1)) {
                    event.preventDefault();
                }
                break;
            case "ArrowDown":
                if (this.navigate(1)) {
                    event.preventDefault();
                }
                break;
            case 'Enter':
                if (this.state.open && this.state.active) {
                    event.preventDefault();
                    this.select(this.state.active);
                    this.close();
                }
                break;
            case 'Escape':
                event.preventDefault();
                this.close();
                break;
            default:
                break;
        }
    }

    private hasSelectable() {
        return this.state.items.length > 0
            && (this.state.items.length > 1 || this.getItemValue(this.state.items[0]) !== this.state.value);
    }

    private onClick(event: React.MouseEvent<HTMLLIElement>, item: ArticleModel) {
        this.select(item);
        this.focus();
        this.close({
            focused: false
        });
    }

    @bind
    private dropdownClass(): string {
        return cssName("dropdown-menu", this.state.open, "show");
    }

    private getItemValue(item: ArticleModel) {
        return item.name;
    }

    private renderItem(item: ArticleModel, active: boolean) {
        return <li key={this.getItemValue(item)}
            className={cssName("dropdown-item", active, "active")}
            onClick={event => this.onClick(event, item)}
            dangerouslySetInnerHTML={{ __html: item.nameHighlighted }}></li>;
    }

    render() {
        const { autoFocus, className } = this.props;
        const { value, active, items } = this.state;
        return (
            <div style={{ position: "relative" }}>
                <input ref={(input) => this.nameInput = input} type="text" className={cssName("form-control", className)}
                    id="name" name="name" value={value} autoFocus={autoFocus} autoComplete="off"
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}
                    onKeyDown={this.onKeyEvent} />
                <ul className={this.dropdownClass()} style={{ right: 0 }}>
                    {items.map(item => this.renderItem(item, active === item))}
                </ul>
                {this.props.children}
            </div>
        );
    }
}

function getInputValue(event: React.SyntheticEvent<Element>): string {
    var target = event.target as HTMLInputElement;
    var value = target.value;
    return value;
}

function canOpen(value: string) {
    return value && value.length >= 2;
}