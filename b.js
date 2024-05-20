const { makeConnection } = require('./connect.js')
const config = require('./components/configLoader.js')(require('./config/connect.js'))

let conn = makeConnection('/example/b')

conn.send({
    context: 'test',
    data: 'Send from B'
})

conn.onMessage((msg)=>{
    conn.send(`Whatever`)
    console.info(msg)
})
