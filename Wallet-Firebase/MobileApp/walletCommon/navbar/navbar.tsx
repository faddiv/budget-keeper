import React from "react";
import { NavLink } from "react-router-dom";
import classNames from "classnames";

import { MenuItem } from "./menuItem";
// import { DropdownMenu } from "./dropdownMenu";
import { Collapse } from "../../react-ext";
import { UserModel, UserServices } from "../../walletServices/userServices";
import { connect } from "react-redux";
import { RootState } from "../../walletServices";
import { bindActionCreators, Dispatch } from "redux";

export interface NavbarProps {
    userModel: UserModel;
    userServices?: typeof UserServices;
}

export interface NavbarState {
    open: boolean;
}

class Navbar2 extends React.Component<NavbarProps, NavbarState> {

    constructor(props: NavbarProps) {
        super(props);
        this.state = {
            open: false
        };
    }

    signOut = () => {
        this.props.userServices?.signOut();
    }

    toggleNavbar = () => {
        this.setState((prevState) => {
            return {
                open: !prevState.open
            };
        });
    }

    renderSignedIn() {
        const { userModel } = this.props;
        return (
            <ul className="navbar-nav">
                <li className="nav-link">{userModel.displayName}</li>
                <li className="nav-link"><a onClick={this.signOut}>Sign-out</a></li>
            </ul>
        );
    }
    renderLogin() {
        return (
            <ul className="navbar-nav">
                <MenuItem to="/login" exact>Login</MenuItem>
            </ul>
        );
    }
    render() {
        const { open } = this.state;
        const { userModel } = this.props;
        const collapsed = !open;
        return (
            <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
                <NavLink to="/" className="navbar-brand" exact>Wallet</NavLink>
                <button className={classNames("navbar-toggler", { collapsed })} type="button"
                    aria-controls="walletNavbar" aria-expanded={open} aria-label="Open main menu" onClick={this.toggleNavbar}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <Collapse open={open} className="navbar-collapse" id="walletNavbar">
                    <ul className="navbar-nav mr-auto">
                        <MenuItem to="/" exact>Home</MenuItem>
                        <MenuItem to="/sharedPrices" exact>Share prices</MenuItem>
                    </ul>
                    <ul className="navbar-nav">
                        {userModel.singedIn ? this.renderSignedIn() : this.renderLogin()}
                    </ul>
                </Collapse>
            </nav>
        );
    }
}

function mapStateToProps(state: RootState) {
    return {
        userModel: state.user
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        userServices: bindActionCreators(UserServices as any, dispatch) as typeof UserServices
    };
}

export const Navbar = connect(mapStateToProps, mapDispatchToProps)(Navbar2);
