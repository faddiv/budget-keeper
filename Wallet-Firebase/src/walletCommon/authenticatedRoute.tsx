import React from "react";
import { Route, Redirect, RouteProps } from "react-router";
import { RootState } from "../walletServices";
import { connect } from "react-redux";
import { UserModel } from "../walletServices/userServices";

export interface AuthenticatedRoute2Props extends RouteProps {
    userModel?: UserModel;
}

export interface AuthenticatedRoute2State {
}

class AuthenticatedRoute2 extends React.Component<AuthenticatedRoute2Props, AuthenticatedRoute2State> {
    
    render() {
        const { userModel, component: Component, location, ...rest } = this.props;
        const pathName = location
            ? "/login?returnUrl=" + location.pathname
            : "/login";
        if (!Component)
            throw new Error("Component is undefined");

        return (
            <Route render={props => (userModel?.singedIn ? <Component {...props} /> : <Redirect to={pathName} />)} {...rest} />
        );
    }
}

function mapStateToProps(state: RootState) {
    return {
        userModel: state.user
    };
}

export const AuthenticatedRoute = connect(mapStateToProps, undefined)(AuthenticatedRoute2) as any as typeof AuthenticatedRoute2;
