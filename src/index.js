import { h, init } from 'snabbdom'
import Watcher from './watcher';
import { observe } from './observe';
import Dep from './dep';
const patch = init([
    require("snabbdom/modules/class").default,
    require("snabbdom/modules/props").default,
    require("snabbdom/modules/style").default,
    require("snabbdom/modules/eventlisteners").default
])




function Vue(options) {
    this._init(options)
}
stateMixin(Vue);
Vue.prototype._init = function (options) {
    this.$options = options;
    initData(this);
    initMethods(this);
    initComputed(this,this.$options.computed);
    initWatch(this,this.$options.watch);
    this.$mount(this.$options.el);
}
//挂载 编译原理 AST语法树
var mountComponent = function (vm,el) {
    // const vnode = this.$options.render.call(this);
    // patch(document.querySelector(el), vnode)
    let updateComponent = function(){
        const vnode = vm.$options.render.call(vm,h);
        if(vm._vnode){
            patch(vm._vnode,vnode)
        }else{
            patch(document.querySelector(el),vnode)
        }
        vm._vnode = vnode;
    }
    //Dep.target = renderWatcher
    new Watcher(vm,updateComponent);
}

Vue.prototype.$mount = function(el){
    return mountComponent(this,el)
}

function noop() { }
//把data代理到Vue实例上,可以以this.title方式访问data

function initData(vm) {
    let data = vm._data = vm.$options.data
    const keys = Object.keys(data);
    let i = keys.length;
    while (i--) {
        const key = keys[i];
        proxy(vm, "_data", key);
    }
    //发布 订阅 观察
    observe(data);
}
//绑定method到Vue实例上
function initMethods(vm) {
    var methods = vm.$options.methods;
    
    if (methods) {
        for (const key in methods) {
            vm[key] = typeof methods[key] !== 'function' ? noop : methods[key].bind(vm)
        }
    }
}
const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
}
function proxy(target, sourceKey, key) {
    //this._data.title
    sharedPropertyDefinition.get = function () {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function (val) {
        this[sourceKey][key] = val;
    }
    //this.title
    Object.defineProperty(target, key, sharedPropertyDefinition);
}

function someFn() {
    console.log("clicked")
}
var vm = new Vue({
    el: '#app',
    data: {
        title: 'prev',
        num:1,
        watchMsg:"msg"
    },
    // computed:{
    //     computedNum(){
    //         return this.num * 100;
    //     }
    // },
    watch:{
        num(newVal,oldVal){
            this.watchMsg = newVal + " dajllda";
        }
    },
    render(h) {
        return h('button', { on: { click: this.someFn } }, this.watchMsg);
    },
    methods:{
        someFn:function(){
            this.num++;
        }
    }
})

function initComputed(vm,computed){
    vm._computedWatchers = Object.create(null);
    var computedWatcherOptions = {
        lazy:true
    }
    for(const key in computed){
        const userDef = computed[key];
        const getter = typeof userDef === 'function'?userDef:userDef.get;
        vm._computedWatchers[key] = new Watcher(vm,getter,noop,computedWatcherOptions);
        defineComputed(vm,key,userDef);
    }
}
function defineComputed(target,key,userDef){
    Object.defineProperty(target,key,{
        enumerable:true,
        configurable:true,
        get(){
            
            const watcher = this._computedWatchers && this._computedWatchers[key];
            if(watcher){
                if(watcher.dirty){
                   
                    watcher.evaluate();
                }
                
                if(Dep.target){
                    watcher.depend();
                }
                return watcher.value;
            }
        },
        set:noop
    })
}


function isPlainObject(obj){
    return Object.prototype.toString.call(obj) === '[object Object]';
}
function initWatch(vm,watch){
    for(const key in watch){
        const handler = watch[key]
        if(Array.isArray(handler)){
            for(let i = 0;i<handler.length;i++){
                createWatcher(vm,key,handler[i])
            }
        }else{
            createWatcher(vm,key,handler)
        }
    }
}
/**
 * num:{
 *  handler(newVal,oldVal){
 *      this.watchMsg = newVal + "12313";
 *  },
 *  deep:true
 * }
 * 
 */
function createWatcher(vm,expOrFn,handler,options){
    
    if(isPlainObject(handler)){
        options = handler
        handler = handler.handler
    }
    if(typeof handler === 'string'){
        handler = vm[handler]
    }
    return vm.$watch(expOrFn,handler,options)
}

function stateMixin(Vue){
    Vue.prototype.$watch = function(expOrFn,cb,options){
        const vm = this;
        if(isPlainObject(cb)){
            return createWatcher(vm,expOrFn,cb,options)
        }
        options = options || {}
        options.user = true
        const watcher = new Watcher(vm,expOrFn,cb,options)
    }
}
