class config {
    constructor(configObject) {
        this.object = configObject
    }
    getProxy() {
        let handler = {
            get: (target, prop)=>{
                let path = prop.split("/")
                path.shift()
                let i = 0
                let property = target[path[i]]
                i++
                while(i<path.length) {
                    property = property[path[i]]
                    i++
                }
                return property
            },
            set: ()=>{
                console.error('Cannot set config yet!')
            },
        }
        
        return new Proxy(this.object, handler)
    }
    get $() {
        return this.getProxy()
    }
}



module.exports = (configObject)=>{
    return new config(configObject)
}
