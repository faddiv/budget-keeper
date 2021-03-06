import * as React from "react";
import * as H from "history";
import { shallow } from "enzyme";
import "jest-enzyme";
import { AlertList2 } from "./alertList";
import { AlertMessage } from "reducers/alerts/alertsModel";
import { AlertsActions } from "actions/alerts";
import { createAlertsActionsMock } from "actions/alerts.mocks";

describe("AlertList", () => {
    let defaultHistory: H.History;
    let actions: typeof AlertsActions;

    beforeEach(() => {
        defaultHistory = H.createMemoryHistory();
        actions = createAlertsActionsMock();
    });

    afterEach(() => {
    });

    it("should show alert with type specified class.", () => {
        const alerts: AlertMessage[] = [
            {
                type: "danger",
                message: "asdf"
            }
        ];
        const element = shallow(<AlertList2 alerts={alerts} history={defaultHistory} actions={actions} />);
        const dangerElement = element.find(".alert.alert-danger");
        expect(dangerElement).not.toBeUndefined();
        expect(dangerElement).toIncludeText("asdf");
    });

    it("should dismiss alert when x is clicked.", () => {
        const alerts: AlertMessage[] = [
            {
                type: "danger",
                message: "asdf"
            },
            {
                type: "info",
                message: "asdf2"
            },
            {
                type: "success",
                message: "asdf3"
            }
        ];
        const element = shallow(<AlertList2 alerts={alerts} history={defaultHistory} actions={actions} />);
        const closeBtn = element.find("button.close");
        closeBtn.at(1).simulate("click");
        expect(actions.dismissAlert).toHaveBeenCalledWith(alerts[1]);
    });

    it("should dismiss all alert when navigated away.", () => {
        const alerts: AlertMessage[] = [
            {
                type: "danger",
                message: "asdf"
            },
            {
                type: "info",
                message: "asdf2"
            },
            {
                type: "success",
                message: "asdf3"
            }
        ];
        shallow(<AlertList2 alerts={alerts} history={defaultHistory} actions={actions} />);
        defaultHistory.push("/someotherpath");
        expect(actions.dismissAllAlert).toHaveBeenCalled();
    });
});
