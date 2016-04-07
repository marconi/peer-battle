import React from 'react'
import Radium from 'radium'

@Radium
class Peer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      countdownInterval: null,
      hasStream: false
    }
  }

  componentDidMount() {
    if (this.props.isBattleStarted && this.props.isActive && !this.state.countdownInterval) {
      this._startCountdown()
    }
  }

  componentWillReceiveProps(nextProps) {
    const isTurn = nextProps.isBattleStarted && nextProps.isActive
    const canCountdownStart = nextProps.hasPeer && !this.state.countdownInterval
    if (isTurn && canCountdownStart) {
      this._startCountdown()
    } else if (!nextProps.isActive && this.state.countdownInterval) {
      this._stopCountdown()
    }

    if (nextProps.stream && !this.state.hasStream) {
      this.refs.video.src = URL.createObjectURL(nextProps.stream)
      this.refs.video.play()
      this.setState({hasStream: true})
    } else if (!nextProps.stream && this.state.hasStream) {
      if (this.refs.video.srcObject) {
        this.refs.video.srcObject.getTracks().forEach(track => track.stop())
      }
      this.refs.video.src = null
      this.setState({hasStream: false})
    }
  }

  render() {
    let startBattleBtn = null
    let passTurnBtn = null
    let restartBattleBtn = null

    if (!this.props.isBattleStarted &&
        this.props.isActive &&
        !this.props.hasPeer) {
      startBattleBtn = (
        <button
          onClick={() => this.props.actions.startBattle()}>Start battle</button>
      )
    }

    if (this.props.isBattleStarted &&
        this.props.isActive &&
        this.props.position === 'local' &&
        this.props.peerCountdown > 0) {
      passTurnBtn = (
        <button
          disabled={!this.props.hasPeer}
          onClick={() => this.props.actions.passTurn(this.props.index)}>Pass the turn</button>
      )
    }

    if (this.props.position === 'local' &&
        !this.props.isBattleStarted &&
        this.props.isBattleEnded) {
      restartBattleBtn = (
        <button
          onClick={() => this.props.actions.restartBattle(this.props.index)}>Restart battle</button>
      )
    }

    return (
      <div style={styles.peer}>
        <div style={[
          styles.countdown,
          this.props.isActive && styles.countdownActive
        ]}>{this._renderCountdown()}</div>
        <video ref="video" style={styles.video} muted={!this.props.isActive}></video>
        <div style={styles.actions}>
          {startBattleBtn}
          {passTurnBtn}
          {restartBattleBtn}
        </div>
      </div>
    )
  }

  _startCountdown() {
    const countdownInterval = setInterval(() => {
      const newCountdown = this.props.countdown - 1
      if (newCountdown < 0) {
        this._stopCountdown()
        return
      }
      this.props.actions.updateCountdown(this.props.index, newCountdown)
    }, 1000)
    this.setState({countdownInterval: countdownInterval})
  }

  _stopCountdown() {
    clearInterval(this.state.countdownInterval)
    this.setState({countdownInterval: null})
  }

  _renderCountdown() {
    const minutes = Math.floor(this.props.countdown / 60)
    const seconds = this.props.countdown % 60
    return this._padNumber(minutes) + ':' + this._padNumber(seconds)
  }

  _padNumber(num) {
    return (num < 10) ? '0' + num : num
  }
}

const styles = {
  peer: {
    display: 'inline-block',
    marginRight: '10px',
    position: 'relative',
    float: 'left'
  },
  countdown: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#fff',
    padding: '0px 5px',
    borderRadius: '4px'
  },
  countdownActive: {
    background: '#9B4DCA',
    color: '#fff'
  },
  video: {
    display: 'inline-block',
    width: '400px',
    height: '300px',
    background: '#ccc',
    borderRadius: '5px'
  },
  actions: {
    textAlign: 'center',
    height: '48px'
  }
}

export default Peer
