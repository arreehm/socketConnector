const inc = require('./inc.js')

const { makeLogger }  = inc('log')
const logger = makeLogger({
    mode: Symbol.for('console')
})

const config = require('./config/connect.js')

const net = require('net')
const fs = require('fs')

console.info(`[  >  ] Making sockets socketing...`)
console.info(config)

class connectorServer {
    constructor(logger, container, path) {
        this.logger = logger
        this.container = container
        this.path = path
        this.connections = []
        this.connectionsCount = 0
        this.clearPath()
        this.makeServer()
    }
    clearPath() {
        if(fs.existsSync(this.path)) fs.rmSync(this.path)
    }
    assignPair(anotherServer) {
        this.anotherServer = anotherServer
    }
    makeServer() {    
        this.anotherServer = null
        this.server = null
        this.server = net.createServer()
        this.server.on('connection', (x)=>{
            this.connectionsCount++
            this.connections[this.connectionsCount-1] = x
            this.connectionListener(this.connectionsCount, x)
            if(this.anotherServer!==null&&this.anotherServer.connectionsCount>0) {
                this.data(JSON.stringify({
                    context: "connectionEstablished",
                }))
                this.anotherServer.data(JSON.stringify({
                    context: "connectionEstablished",
                }))
            }
            
        })
        this.server.on('error', (error)=>{
            this.logger.write(error)
        })
    }
    connectionListener(count, x) {
        x.on('data', (xx)=>{
            this.dataListener(xx)
        })
        x.on('error', (error)=>{
            this.logger.write(error)
        })
        x.on('end', ()=>{
            delete this.connections[count-1]
        })
    }
    dataListener(data) {
        this.anotherServer.data(data)
    }
    listen() {
        this.server.listen(this.path)
    }
    data(data) {
        this.connections.forEach((x)=>{
            x.write(data)
        })
    }
    close() {
        this.server.close()
    }
}

const makeConnectorServer = (logger, container, path)=>{
    return new connectorServer(logger, container, path)
}

class connectorPair {
    constructor(one, two) {
        this.one = one
        this.two = two
        this.assignEach()
    }
    assignEach() {
        this.one.assignPair(this.two)
        this.two.assignPair(this.one)
    }
}
const makePair = (one, two)=>{
    return new connectorPair(one, two)
}

class connectorContainer {
    constructor(logger, config) {
        this.logger = logger
        this.config = config
        this.ends = []
        this.makeServers()
        this.gracefullTermination()
    }
    makeServers() {
        this.servers = {}
        Object.entries(this.config).forEach((x)=>{
            this.servers[x[0]] = {}
            let pair = Object.entries(x[1]).map((xx)=>{
                let server = makeConnectorServer(this.logger, this, xx[1])
                this.servers[x[0]][xx[0]] = server
                this.ends.push(server)
                return server
            })
            makePair(...pair)
        })
    }
    listen() {
        this.ends.forEach((x)=>{
            x.listen()
        })
    }
    gracefullTermination() {
    
        process.on('SIGTERM', ()=>{
            this.ends.forEach((x)=>{
                x.close()
            })
            process.exit()
        })
        
        process.on('SIGINT', ()=>{
            this.ends.forEach((x)=>{
                x.close()
            })
            process.exit()
        })
        
    }
}
const makeContainer = (logger, config)=>{
    return new connectorContainer(logger, config)
}

let container = makeContainer(logger, config)

container.listen()
