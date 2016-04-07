import React from 'react'
import Radium from 'radium'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import Peer from './Peer'
import {
  updateCountdown,
  passTurn,
  setPeer,
  setPeerId,
  setRemoteStream,
  setLocalStream,
  clearStreams,
  setPeerConfig,
  startBattle,
  createSignalChannel,
  restartBattle
} from '../actions'

@Radium
class App extends React.Component {
  constructor(props) {
    super(props)
    this.props.actions.createSignalChannel()
  }

  render() {
    return (
      <div style={styles.app}>
        <div>
          <Peer
            {...this.props.peer1}
            isBattleStarted={this.props.isBattleStarted}
            isBattleEnded={this.props.isBattleEnded}
            hasPeer={this.props.peer2.stream !== null}
            peerCountdown={this.props.peer2.countdown}
            actions={{
              updateCountdown: this.props.actions.updateCountdown,
              passTurn: this.props.actions.passTurn,
              startBattle: this.props.actions.startBattle,
              restartBattle: this.props.actions.restartBattle
            }} />
          <Peer
            {...this.props.peer2}
            isBattleStarted={this.props.isBattleStarted}
            isBattleEnded={this.props.isBattleEnded}
            peerCountdown={this.props.peer1.countdown}
            hasPeer={this.props.peer1.stream !== null}
            actions={{
              updateCountdown: this.props.actions.updateCountdown,
              passTurn: this.props.actions.passTurn,
              restartBattle: this.props.actions.restartBattle
            }} />
        </div>
      </div>
    )
  }
}

const styles = {
  app: {
    width: '820px',
    margin: '50px auto'
  }
}

const mapStateToProps = (state) => {
  return state
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators({
      updateCountdown,
      passTurn,
      setPeer,
      setPeerId,
      setRemoteStream,
      setLocalStream,
      clearStreams,
      setPeerConfig,
      startBattle,
      createSignalChannel,
      restartBattle
    }, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
