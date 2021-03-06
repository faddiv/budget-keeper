import "./scss/site.scss";
import "moment/locale/hu";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Router, Route, Switch } from "react-router";
import { createBrowserHistory } from "history";
import "./firebaseInit";
import * as serviceWorker from "./serviceWorker";
import { library } from "@fortawesome/fontawesome-svg-core"
import { faCheck, faTrash, faEdit, faSave, faTimes } from "@fortawesome/free-solid-svg-icons"

import { configureStore } from "./store";
import { Home, Login, SharePrices } from "./pages";
import { initUserServices } from "./walletServices/userServices";
import { AuthenticatedRoute } from "./walletCommon";
import { initToDoServices } from "./walletServices/toDoServices";

const history = createBrowserHistory();
const store = configureStore();

library.add(faCheck, faTrash, faEdit, faSave, faTimes)

initUserServices(store.dispatch);
initToDoServices(store.dispatch);

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Switch>
                <AuthenticatedRoute path="/" exact component={Home} />
                <AuthenticatedRoute path="/sharedPrices" exact component={SharePrices} />
                <Route path="/login" component={Login} />
            </Switch>
        </Router >
    </Provider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
