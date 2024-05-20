module.exports = (module)=>{
    let fs = require('fs')
    if(fs.existsSync('./components/'+module+'.js')) {
        return require('./components/'+module+'.js')
    }
    if(fs.existsSync('./components/'+module+'/inc.js')) {
        return require('./components/'+module+'/inc.js')
    }
    return require(module)
}
