const { makeConnection } = require('./connect.js')
const config = require('./components/configLoader.js')(require('./config/connect.js'))

let conn = makeConnection('/example/a')

conn.send({
    context: 'test',
    data: 'Send from A'
})

conn.onMessage((msg)=>{
    console.info(msg)
})
