import * as React from "react";
import { Autocomplete } from "react-ext";
import { ArticleModel, articleService } from "walletApi";

interface NameInputProps {
    value: string;
    onError: (error: Error) => void;
    onChange?: (value: React.SyntheticEvent<HTMLInputElement>) => void;
    autoFocus?: boolean;
    onSelect?: (selected: ArticleModel) => void;
    className?: string;
    focusAction?: (focus: () => void) => void;
}

export const NameInput: React.SFC<NameInputProps> = ({ value, onChange, autoFocus, onSelect, className, focusAction, onError, ...rest }) => {
    return (
        <Autocomplete name="name" focusAction={focusAction} value={value} onFilter={filter} autoFocus={autoFocus} onChange={onChange} onSelect={onSelect} className={className} onError={onError}>
            {rest.children}
        </Autocomplete>
    );
};

function filter(value: string) {
    return articleService.filterBy(value);
}
