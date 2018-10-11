import { createStore, combineReducers } from 'redux';
import users from './ducks/users'

const rootReducer = combineReducers({
    users: users
})

export default createStore(rootReducer)