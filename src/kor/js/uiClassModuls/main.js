import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';

/*
 * Action
 */
const INCREMENT = "INCREMENT";
const DECREMENT = "DECREMENT";

function increase(diff) {
    return {
        type: INCREMENT,
        addBy: diff
    };
}

function decrement(diff) {
    return {
        type: DECREMENT,
        addBy: diff
    };
}

/*
 * Reducer
 */
const initialState = {
    value: 0
};

const counterReducer = (state = initialState, action) => {
    switch(action.type) {
        case INCREMENT:
            return Object.assign({}, state, {
                value: state.value + action.addBy
            });

        case DECREMENT:
        	return Object.assign({}, state, {
        		value: state.value - action.addBy
        	});

        default:
            return state;
    }
}

/*
 * Store
 */
const store = createStore(counterReducer);

class App extends React.Component {
    constructor(props) {
        super(props);
        this.onClickINCREMENT = this.onClickINCREMENT.bind(this);
        this.onClickDECREMENT = this.onClickDECREMENT.bind(this);
    }

    render() {

        let centerStyle = {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            MsUserSelect:'none',
            userSelect: 'none',
            cursor: 'pointer'
        };

        return (
            <div style={ centerStyle }>
                <h1> {this.props.store.getState().value} </h1>
                <button onClick={ this.onClickINCREMENT }>INCREMENT</button>
                <button onClick={ this.onClickDECREMENT }>DECREMENT</button>
            </div>
        )
    }

    onClickINCREMENT() {
        this.props.store.dispatch(increase(1));
    }

    onClickDECREMENT() {
        this.props.store.dispatch(decrement(1));
    }
}

const render = () => {

    const appElement = document.getElementById('uiClassModuls');
    ReactDOM.render(
        <App store={store}/>,
        appElement
    );
};

store.subscribe(render);
render();
