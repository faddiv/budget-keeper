import { ISharePrice, IPersonCost, ISharedPrice, IDetailElement } from './models';
import { useReducer, useMemo } from 'react';
import { _ } from "helpers";

export function usePriceSharing() {
    const [state, dispatch] = useReducer(reducer, 1, init);

    const packedDispatch = useMemo(() => {
        return {
            addPerson(name: string) {
                dispatch({
                    type: "AddPerson",
                    name
                });
            },
            addSharedCost(name: string) {
                dispatch({
                    type: "AddSharedCost",
                    name
                });
            },
            addPersonCost(personCost: IPersonCost, name: string, price: number) {
                dispatch({
                    type: "AddPersonCost",
                    personCost,
                    name,
                    price
                });
            }
        } as IPriceSharingDispatcher
    }, [])
    return {
        state,
        dispatch: packedDispatch
    };
}

export interface IPriceSharingDispatcher {
    addPerson(name: string): void;
    addSharedCost(name: string): void;
    addPersonCost(personCost: IPersonCost, name: string, price: number): void;
    addPersonToSharedCost(sharedPrice: ISharedPrice, name: string, price: number): void;
}

function reducer(state: ISharePrice, action: IActions) {
    let newState = state;
    let id = state.id + 1;
    switch (action.type) {
        case "AddPerson":
            {
                const personCost: IPersonCost = {
                    personName: action.name,
                    details: [],
                    sharedPrices: state.sharedPrices.map<IDetailElement>(e => {
                        return {
                            id: e.id,
                            editable: false,
                            intValue: 0,
                            name: e.activityName,
                            value: ""
                        };
                    }),
                    expense: 0,
                    id
                };
                const sharedPrices: ISharedPrice[] = [];
                for (const sharedPrice of state.sharedPrices) {
                    const intValue = _.max(sharedPrice.details, d => d.intValue) || 1;
                    sharedPrices.push({
                        ...sharedPrice,
                        details: [
                            ...sharedPrice.details,
                            {
                                id: personCost.id,
                                editable: true,
                                intValue: intValue,
                                value: toTime(intValue),
                                name: personCost.personName
                            }
                        ]
                    });
                }
                newState = {
                    id,
                    costPerPersons: [
                        ...state.costPerPersons,
                        personCost
                    ],
                    sharedPrices
                };
                newState = recalculate(newState);
            }
            break;
        case "AddSharedCost":
            {
                const sharedPrices: ISharedPrice[] = [
                    ...state.sharedPrices,
                    {
                        activityName: action.name,
                        price: 0,
                        details: state.costPerPersons.map<IDetailElement>(d => {
                            return {
                                id: d.id,
                                editable: false,
                                intValue: 60,
                                value: toTime(60),
                                name: d.personName
                            };
                        }),
                        id: state.id
                    }
                ];
                newState = {
                    id,
                    sharedPrices,
                    costPerPersons: state.costPerPersons.map<IPersonCost>(e => {
                        return {
                            id: e.id,
                            details: e.details,
                            expense: 0,
                            personName: e.personName,
                            sharedPrices: []
                        };
                    })
                };
                newState = recalculate(newState);
            }
            break;
        case "AddPersonCost":

            newState = {
                ...state,
                id: state.id + 1,
                costPerPersons: _.replace(state.costPerPersons, {
                    ...action.personCost,
                    details: [...action.personCost.details, {
                        id: state.id + 1,
                        name: action.name,
                        intValue: action.price,
                        value: action.price.toString(),
                        editable: true
                    }]
                }, action.personCost)
            };
            newState = recalculate(newState);
            break;
        default:
            break;
    }
    return newState;
}

function init(id: number): ISharePrice {
    return recalculate({
        id: 6,
        costPerPersons: [{
            id: 1,
            personName: "Viktor",
            expense: 10000,
            sharedPrices: [
                {
                    id: 3,
                    name: "Billiárd",
                    value: "",
                    intValue: 0,
                    editable: false
                },
                {
                    id: 4,
                    name: "Darts",
                    value: "",
                    intValue: 0,
                    editable: false
                }
            ],
            details: [
                {
                    id: 5,
                    name: "Étel",
                    value: "1000",
                    intValue: 1000,
                    editable: true
                }
            ]
        }, {
            id: 2,
            personName: "Bea",
            expense: 10000,
            sharedPrices: [
                {
                    id: 3,
                    name: "Billiárd",
                    value: "",
                    intValue: 0,
                    editable: false
                },
                {
                    id: 4,
                    name: "Darts",
                    value: "",
                    intValue: 0,
                    editable: false
                }
            ],
            details: [
                {
                    id: 6,
                    name: "Étel",
                    value: "1000",
                    intValue: 1000,
                    editable: true
                }
            ]
        }],
        sharedPrices: [{
            id: 3,
            activityName: "Billiárd",
            price: 2000,
            details: [
                {
                    id: 1,
                    editable: true,
                    name: "Viktor",
                    value: "01:30",
                    intValue: 90
                },
                {
                    id: 2,
                    editable: true,
                    name: "Bea",
                    value: "02:00",
                    intValue: 120
                }
            ]
        }, {
            id: 4,
            activityName: "Darts",
            price: 3000,
            details: [
                {
                    id: 1,
                    editable: true,
                    name: "Viktor",
                    value: "01:30",
                    intValue: 90
                },
                {
                    id: 2,
                    editable: true,
                    name: "Bea",
                    value: "02:00",
                    intValue: 120
                }
            ]
        }]
    });
}

function toTime(totalMinutes: number) {
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

type IActions = IAddPerson | IAddSharedCost | IAddPersonCost;

interface IAddPerson {
    type: "AddPerson";
    name: string;
}

interface IAddSharedCost {
    type: "AddSharedCost";
    name: string;
}

interface IAddPersonCost {
    type: "AddPersonCost";
    personCost: IPersonCost;
    name: string;
    price: number;
}

function recalculate(state: ISharePrice): ISharePrice {
    const costPerPersons: IPersonCost[] = recalculateCostPerPersons(state);

    return {
        id: state.id,
        costPerPersons: costPerPersons,
        sharedPrices: state.sharedPrices
    };
}

function recalculateCostPerPersons(state: ISharePrice) {
    const costPerPersons: IPersonCost[] = [];
    for (const personCost of state.costPerPersons) {
        const sharedPrices: IDetailElement[] = [];
        for (const sharedPrice of state.sharedPrices) {
            const sumTime = _.sum(sharedPrice.details, d => d.intValue);
            const personDetail = sharedPrice.details.find(e => e.id === personCost.id);
            if (!personDetail)
                throw new Error("Person detail not found");
            const ownCost = sumTime === 0
                ? 0
                : Math.round(sharedPrice.price * personDetail.intValue / sumTime);
            sharedPrices.push({
                id: sharedPrice.id,
                editable: false,
                name: sharedPrice.activityName,
                intValue: ownCost,
                value: ownCost.toString()
            });
        }
        const expense = _.sum(sharedPrices, e => e.intValue)
            + _.sum(personCost.details, e => e.intValue);
        costPerPersons.push({
            id: personCost.id,
            expense: expense,
            personName: personCost.personName,
            details: personCost.details,
            sharedPrices: sharedPrices
        });
    }
    return costPerPersons;
}
