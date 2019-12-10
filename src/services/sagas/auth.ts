import { call as typedCall } from 'typed-redux-saga'
import * as api from '../../api/index'
import * as loginActions from '../actions/auth/login'
import * as checkTokenActions from '../actions/auth/checkToken'
import { SagaIterator } from 'redux-saga'
import * as types from '../actions/auth/authActionTypes'
import { put, fork, take, cancel, cancelled } from 'redux-saga/effects'

// TODO: need a little bit of refactoring

function* authorize(payload: api.LoginParams): SagaIterator {
	try {
		const token = yield* typedCall(api.login, payload)
		localStorage.setItem('token', 'admin@mail.ru')
		yield put(loginActions.resolveLogin(token))
	} catch (err) {
		yield put(loginActions.rejectLogin(err))
	} finally {
		if (yield cancelled()) {
			yield put(
				loginActions.rejectLogin(new Error('authorize task was cancelled'))
			)
		}
	}
}

function* checkToken(): SagaIterator {
	const token = localStorage.getItem('token')
	if (token === 'admin@mail.ru') {
		yield put(loginActions.resolveLogin({ username: token }))
	} else {
		yield put(checkTokenActions.checkTokenReject())
	}
}

export function* authFlow(): SagaIterator {
	while (true) {
		// TODO: figure out why i cannot pass action creator to take() and make it work the right way
		const { payload }: { payload: api.LoginParams } = yield take(
			types.AUTH_LOGIN_REQUEST
		)
		const task = yield fork(authorize, payload)
		const action = yield take([
			types.AUTH_LOGIN_REJECT,
			types.AUTH_LOGOUT_REQUEST,
		])
		if (action.type === types.AUTH_LOGOUT_REQUEST) {
			yield cancel(task)
		}
		localStorage.removeItem('token')
	}
}