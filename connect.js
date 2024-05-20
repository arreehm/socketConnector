const configLoader = require('./components/configLoader.js')
const config = configLoader(require('./config/connect.js'))
const net = require('net')

class connect {
    constructor(connectionLink) {
        this.link = config.$[connectionLink]
        this.config = config
        this.lag = []
        this.makeNewConnection()
        this.interval = null
        this.alreadyGotError = -1
    }
    makeNewConnection() {
        this.conn = net.connect(this.link)
        this.weGotNewConnection()
    }
    onMessage(fn) {
        this._onMessage = fn
    }
    weGotNewConnection() {
        this.conn.on('data', (data)=>{
            data = JSON.parse(data)
            if(data.context=="connectionEstablished") {
                this.override()
                this.execute()
            }
            else this._onMessage(data)
        })
        this.conn.on('connect', ()=>{
            clearInterval(this.interval)
            this.interval = null
            this.alreadyGotError = -1
        })
        this.conn.on('end', ()=>{
            this.reverseOverride()
        })
        this.conn.on('error', (error)=>{
            if(error.code=='ENOENT') {
                this.alreadyGotError++
                if(this.alreadyGotError>0) {
                    if(this.alreadyGotError%60===0) console.info(`[  !  ] ENOENT error persists for ${this.alreadyGotError/60} minutes... (${this.link})`)
                    return
                }
            }
            console.info(`[  !  ] Connector error (${this.link}) :`, error)
        })
        this.conn.on('close', ()=>{
            this.reverseOverride()
            if(this.interval==null) this.notConnected()
        })
    }
    notConnected() {
        this.interval = setInterval(()=>{
            this.makeNewConnection()
        }, 1000)
    }
    reverseOverride() {
        this.send = (msg)=>{    
            this.lag.push(JSON.stringify(msg))
        }
    }
    override() {
        this.send = (msg)=>{
            this.conn.write(JSON.stringify(msg))
        }
    }
    execute() {
        this.lag.forEach((x)=>{
            this.conn.write(x)
        })
        this.lag = []
    }
    send(msg) {
        this.lag.push(JSON.stringify(msg))
    }
    on(event, fn) {        
        this.conn.on(event, fn)
    }
    
}

const makeConn = (link)=>{
    return new connect(link)
}

module.exports = { makeConnection: makeConn }
