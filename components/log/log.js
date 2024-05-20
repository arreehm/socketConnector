class logger {
    constructor(params) {
        if(params.mode==Symbol.for('console')) {
            this.write = (...x)=>{
                console.info(`[  >  ] `,...x)
            }
        }
    }
}

module.exports = {
    makeLogger: (x)=>{
        return new logger(x)
    }
}
