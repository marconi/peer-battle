import SignalChannel from '../libs/signal'

export const UPDATE_COUNTDOWN = 'UPDATE_COUNTDOWN'
export const updateCountdown = (peerIndex, newCountdown) => {
  return (dispatch) => {
    if (newCountdown <= 0) {
      dispatch(countdownExpired(peerIndex))
    }

    return dispatch({
      type: UPDATE_COUNTDOWN,
      peerIndex: peerIndex,
      data: newCountdown
    })
  }
}

export const PASS_TURN = 'PASS_TURN'
export const passTurn = (peerIndex) => {
  console.log('calling PASS_TURN...')

  return (dispatch, getState) => {
    console.log('actually PASS_TURN')
    const {peerId, signalChannel} = getState()
    signalChannel.send(peerId, {turn: true})
    return dispatch({
      type: PASS_TURN,
      peerIndex: peerIndex
    })
    return {}
  }
}

export const CREATE_SIGNAL_CHANNEL = 'CREATE_SIGNAL_CHANNEL'
export const createSignalChannel = () => {
  return (dispatch, getState) => {

    const onPeerConfig = (config) => {
      dispatch(setPeerConfig(config))

      const peer = new RTCPeerConnection(config)
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('sending ice candidate')
          const {peerId, signalChannel} = getState()
          signalChannel.send(peerId, {candidate: event.candidate})
        }
      }
      peer.onaddstream = (event) => {
        const {peer1} = getState()
        const peerIndex = (peer1.position === 'remote') ? 1 : 2
        console.log('adding remote stream to:', peerIndex)
        dispatch(setStream(peerIndex, event.stream))
      }
      peer.onremovestream = () => dispatch(closeVideoCall())
      peer.oniceconnectionstatechange = (event) => {
        switch (peer.iceConnectionState) {
          case 'closed':
          case 'failed':
          case 'disconnected':
            dispatch(closeVideoCall())
            break
        }
      }
      peer.onsignalingstatechange = (event) => {
        switch (peer.signalingState) {
          case 'closed':
            dispatch(closeVideoCall())
            break
        }
      }

      getUserMedia({audio: true, video: true},
        (stream) => {
          peer.addStream(stream)
          dispatch(setStream(1, stream))
        }, (err) => {
          console.log('error getting user media:', err)
        })

      dispatch(setPeer(peer))
    }

    const onPeerId = (peerId) => dispatch(setPeerId(peerId))

    const onPeerSignal = (signal) => {
      const {peer, peerId, signalChannel} = getState()

      if (signal.candidate) {
        console.log('adding received ice candidate')
        try {
          peer.addIceCandidate(new RTCIceCandidate(signal.candidate))
        } catch (e) {
          // console.log('error adding ice candidate:', signal.candidate)
        }
      }

      if (signal.offer) {
        console.log('received offer')
        peer.setRemoteDescription(new RTCSessionDescription(signal.offer), () => {

          // we just received an offer, so we move to right pane
          // and let initiator take the left pane.
          dispatch(moveStream(1))

          // then set left pane as remote and right as local
          dispatch(setPositions('remote', 'local'))

          peer.createAnswer((answer) => {
            console.log('sending answer')
            peer.setLocalDescription(new RTCSessionDescription(answer))
            signalChannel.send(peerId, {answer: answer})
          }, (err) => {
            console.log('error creating answer:', err)
          })
        }, (err) => {
          console.log('error setting remote description:', err)
        })
      }

      if (signal.answer) {
        console.log('received answer')
        peer.setRemoteDescription(new RTCSessionDescription(signal.answer))
      }

      if (signal.turn) {
        dispatch(activatePeer('local'))
      }

      if (signal.restart) {
        dispatch({
          type: RESTART_BATTLE,
          peerIndex: signal.peerIndex
        })
      }

      if (signal.stop) {
        dispatch({type: STOP_BATTLE})
      }
    }

    const signalChannel = new SignalChannel('battleroom')
    signalChannel.connect(onPeerConfig, onPeerId, onPeerSignal)

    dispatch({
      type: CREATE_SIGNAL_CHANNEL,
      data: signalChannel
    })
  }
}

export const SET_PEER = 'SET_PEER'
export const setPeer = (peer) => ({type: SET_PEER, data: peer})

export const SET_PEER_ID = 'SET_PEER_ID'
export const setPeerId = (peerId) => ({type: SET_PEER_ID, data: peerId})

export const SET_PEER_CONFIG = 'SET_PEER_CONFIG'
export const setPeerConfig = (config) => ({type: SET_PEER_CONFIG, data: config})

export const SET_STREAM = 'SET_STREAM'
export const setStream = (peerIndex, stream) => {
  return {
    type: SET_STREAM,
    data: stream,
    peerIndex: peerIndex
  }
}

export const MOVE_STREAM = 'MOVE_STREAM'
export const moveStream = (peerIndex) => {
  return {
    type: MOVE_STREAM,
    peerIndex: peerIndex
  }
}

export const SET_POSITIONS = 'SET_POSITIONS'
export const setPositions = (leftPosition, rightPosition) => {
  return {
    type: SET_POSITIONS,
    leftPosition: leftPosition,
    rightPosition: rightPosition
  }
}

export const ACTIVATE_PEER = 'ACTIVATE_PEER'
export const activatePeer = (position) => {
  return {
    type: ACTIVATE_PEER,
    position: position
  }
}

export const CLOSE_VIDEO_CALL = 'CLOSE_VIDEO_CALL'
export const closeVideoCall = () => {
  return (dispatch, getState) => {
    const {peer} = getState()
    peer.onicecandidate = null
    peer.onaddstream = null
    peer.onnremovestream = null
    peer.oniceconnectionstatechange = null
    peer.onicegatheringstatechange = null
    peer.onsignalingstatechange = null
    peer.onnegotiationneeded = null
    return {type: CLOSE_VIDEO_CALL}
  }
}

export const START_BATTLE = 'START_BATTLE'
export const startBattle = () => {
  return (dispatch, getState) => {
    const {peer, peerId, signalChannel} = getState()

    console.log('creating offer')
    peer.createOffer((offer) => {
      console.log('setting offer locally')
      peer.setLocalDescription(offer, () => {
        console.log('sending offer')
        signalChannel.send(peerId, {offer: offer})
      }, (err) => {
        console.log('error setting local description:', err)
      })
    }, (err) => {
      console.log('error creating offer:', err)
    })

    dispatch({type: START_BATTLE})
  }
}

export const COUNTDOWN_EXPIRED = 'COUNTDOWN_EXPIRED'
export const countdownExpired = (peerIndex) => {
  return (dispatch, getState) => {
    const {peer1, peer2} = getState()
    if ((peerIndex === 1 && peer2.countdown > 0)
     || (peerIndex === 2 && peer1.countdown > 0)) {
      dispatch(passTurn(peerIndex))
    } else {
      dispatch(stopBattle())
    }
    return dispatch({type: COUNTDOWN_EXPIRED})
  }
}

export const STOP_BATTLE = 'STOP_BATTLE'
export const stopBattle = () => {
  return (dispatch, getState) => {
    const {peerId, signalChannel} = getState()
    signalChannel.send(peerId, {stop: true})
    return dispatch({type: STOP_BATTLE})
  }
}

export const RESTART_BATTLE = 'RESTART_BATTLE'
export const restartBattle = (peerIndex) => {
  return (dispatch, getState) => {
    const {peerId, signalChannel} = getState()
    signalChannel.send(peerId, {restart: true, peerIndex: peerIndex})
    return dispatch({
      type: RESTART_BATTLE,
      peerIndex: peerIndex
    })
  }
}
