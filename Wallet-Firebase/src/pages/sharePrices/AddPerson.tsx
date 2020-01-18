import React from "react";
import classNames from "classnames";
import { useSingleValueAdd } from './reducers/singleValueAdd';

interface AddPersonProps {
    onAddPerson(name: string): void;
}

export const AddPerson: React.FunctionComponent<AddPersonProps> = ({ onAddPerson }) => {

    const { state, changeHandler, onSubmit } = useSingleValueAdd(onAddPerson);
    const { invalid, showError, value } = state;

    return (
        <form onSubmit={onSubmit}>
            <div className="form-group">
                <div className="input-group">
                    <input
                        name="person"
                        lang="hu"
                        className={classNames("form-control", { "is-invalid": invalid && showError })}
                        placeholder="Person"
                        onChange={changeHandler}
                        type="text"
                        value={value}
                    />
                    <div className="input-group-append">
                        <button type="submit" className="btn btn-primary">Add</button>
                    </div>
                </div>
                <div className="invalid-feedback" style={{ display: invalid && showError ? "block" : "none" }}>
                    {"Hiba"}
                </div>
            </div>
        </form>
    );
};
