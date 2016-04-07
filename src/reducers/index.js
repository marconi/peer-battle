import {
  UPDATE_COUNTDOWN,
  PASS_TURN,
  CREATE_SIGNAL_CHANNEL,
  SET_PEER,
  SET_PEER_ID,
  SET_STREAM,
  MOVE_STREAM,
  CLOSE_VIDEO_CALL,
  SET_PEER_CONFIG,
  START_BATTLE,
  SET_POSITIONS,
  ACTIVATE_PEER,
  STOP_BATTLE,
  RESTART_BATTLE
} from '../actions'

const defaultCountdown = 30 // seconds
const initialState = {
  signalChannel: null,
  peerId: null,
  peer: null,
  peerConfig: null,
  isBattleStarted: false,
  isBattleEnded: false,
  peer1: {
    index: 1,
    countdown: defaultCountdown,
    isActive: true,
    stream: null,
    position: 'local'
  },
  peer2: {
    index: 2,
    countdown: defaultCountdown,
    isActive: false,
    stream: null,
    position: 'remote'
  }
}

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_COUNTDOWN:
      return Object.assign({}, state, {
        peer1: Object.assign({}, state.peer1, {
          countdown: (action.peerIndex === 1) ? action.data : state.peer1.countdown,
        }),
        peer2: Object.assign({}, state.peer2, {
          countdown: (action.peerIndex === 2) ? action.data : state.peer2.countdown,
        })
      })
    case PASS_TURN:
      let peer1 = state.peer1
      let peer2 = state.peer2
      if (action.peerIndex === 1) {
        peer1 = Object.assign({}, peer1, {isActive: false})
        peer2 = Object.assign({}, peer2, {isActive: true})
      } else {
        peer1 = Object.assign({}, peer1, {isActive: true})
        peer2 = Object.assign({}, peer2, {isActive: false})
      }
      return Object.assign({}, state, {
        peer1: peer1,
        peer2: peer2
      })
    case SET_POSITIONS:
      return Object.assign({}, state, {
        peer1: Object.assign({}, state.peer1, {
          position: action.leftPosition
        }),
        peer2: Object.assign({}, state.peer2, {
          position: action.rightPosition
        })
      })
    case CREATE_SIGNAL_CHANNEL:
      return Object.assign({}, state, {signalChannel: action.data})
    case SET_PEER:
      return Object.assign({}, state, {peer: action.data})
    case SET_PEER_ID:
      return Object.assign({}, state, {peerId: action.data})
    case SET_PEER_CONFIG:
      return Object.assign({}, state, {peerConfig: action.data})
    case SET_STREAM:
      return Object.assign({}, state, {
        peer1: Object.assign({}, state.peer1, {
          stream: (action.peerIndex === 1) ? action.data : state.peer1.stream
        }),
        peer2: Object.assign({}, state.peer2, {
          stream: (action.peerIndex === 2) ? action.data : state.peer2.stream
        })
      })
    case MOVE_STREAM:
      let peer1move = null
      let peer2move = null

      if (action.peerIndex === 1) {
        peer1move = Object.assign({}, state.peer1, {
          stream: null,
          isActive: true // true since we're giving way for initiator stream
        })
        peer2move = Object.assign({}, state.peer2, {
          stream: state.peer1.stream,
          isActive: false
        })
      } else {
        peer1move = Object.assign({}, state.peer1, {
          stream: state.peer2.stream,
          isActive: false
        })
        peer2move = Object.assign({}, state.peer2, {
          stream: null,
          isActive: true
        })
      }

      return Object.assign({}, state, {
        isBattleStarted: true, // true since we received a remote stream
        peer1: peer1move,
        peer2: peer2move
      })
    case ACTIVATE_PEER:
      return Object.assign({}, state, {
        peer1: Object.assign({}, state.peer1, {
          isActive: (state.peer1.position === action.position) ? true : false
        }),
        peer2: Object.assign({}, state.peer2, {
          isActive: (state.peer2.position === action.position) ? true : false
        }),
      })
    case CLOSE_VIDEO_CALL:
      return Object.assign({}, state, {
        peer1: Object.assign({}, state.peer1, {stream: null}),
        peer2: Object.assign({}, state.peer2, {stream: null})
      })
    case START_BATTLE:
      return Object.assign({}, state, {isBattleStarted: true})
    case STOP_BATTLE:
      return Object.assign({}, state, {
        isBattleStarted: false,
        isBattleEnded: true
      })
    case RESTART_BATTLE:
      return Object.assign({}, state, {
        isBattleStarted: true,
        isBattleEnded: false,
        peer1: Object.assign({}, state.peer1, {
          countdown: defaultCountdown,
          isActive: (action.peerIndex === 1) ? true : false
        }),
        peer2: Object.assign({}, state.peer2, {
          countdown: defaultCountdown,
          isActive: (action.peerIndex === 2) ? true : false
        })
      })
    default:
      return state
  }
}

export default appReducer
