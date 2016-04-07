import axios from 'axios'

export default class SignalChannel {
  constructor(roomName) {
    this.signalHost = 'webrtc.marconijr.com'
    this.roomName = roomName
  }

  send(peerId, data) {
    axios.post('https://' + this.signalHost + '/signal/' + this.roomName + '/' + peerId, data, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .catch((err) => {
        console.log('error sending:', err)
      })
  }

  connect(configCb, peerIdCb, signalCb) {
    const source = new EventSource('https://' + this.signalHost + '/signal/stream/sse/' + this.roomName)

    source.onopen = () => { console.log('sse connected') }
    source.onerror = (err) => { console.log('sse error:', err) }
    source.addEventListener('config', (event) => {
      configCb(JSON.parse(event.data))
    })
    source.addEventListener('peerId', (event) => {
      peerIdCb(JSON.parse(event.data).id)
    })
    source.addEventListener('signal', (event) => {
      signalCb(JSON.parse(event.data))
    })
  }
}
