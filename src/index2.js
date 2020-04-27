

function Vue(options){
    this._init(options);
}
Vue.prototype._init = function(options){
    this.$options = options;
    initData(this);
    initMethods(this);
}
function initData(vm){
    let data = vm._data = vm.$options.data;
    const keys = Object.keys(data);
    let i = keys.length;
    while(i--){
        const key = keys[i];
        proxy(vm,'_data',key);
    }
    observe(data)
}
function noop(){}
const sharedPropertyDefinition = {
    enumerable:true,
    configurable:true,
    set:noop,
    get:noop
}
function proxy(target,sourceKey,key){
    sharedPropertyDefinition.get = function(){
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function(val){
        this[sourceKey][key] = val
    }
    Object.defineProperty(target,key,sharedPropertyDefinition);
}

function initMethods(vm){
    var methods = vm.$options.methods;
    for(const key in methods){
        vm[key] = typeof methods[key] === 'function' ? noop : methods[key].bind(vm);
    }
}

function observe(data){
    if(!data || typeof data !== 'object'){
        return;
    }
    for(var key in data){
        var dep = new Dep();
        let val = data[key];
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:true,
            get(){
                if(Dep.target){
                    dep.addSub(Dep.target);
                }
                return val;
            },
            set(newVal){
                if(newVal === val) return;
                val = newVal;
                dep.notify();
            }
        })
    }
}
let uid = 0;
function Dep(){
    this.id = ++uid;
    this.subs = [];
    this.subsId = new Set();
}
Dep.prototype.addSub = function(sub){
    if(!this.subsId.has(sub.id)){
        this.subs.push(sub);
        this.subsId.add(sub.id);
    }
}
Dep.prototype.notify = function(){
    this.subs.forEach(function(sub){
        sub.update();
    })
}
Dep.target = null;


function Watcher(vm,cb){
    this.vm = vm,
    this.cb = cb;
    this.value = this.get();
}
Watcher.prototype.update = function(){
    return this.get();
}
Watcher.prototype.s = function(){
    Dep.target = this;
    this.cb.call(this.vm);
    Dep.target = null;
}

// new Watcher(vm,updateComponent)

function updateComponent(){
    //this.render.call(vm,h)
    //
}