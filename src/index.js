import { h, init } from 'snabbdom'
const patch = init([
    require("snabbdom/modules/class").default,
    require("snabbdom/modules/props").default,
    require("snabbdom/modules/style").default,
    require("snabbdom/modules/eventlisteners").default
])




function Vue(options) {
    this._init(options)
}
Vue.prototype._init = function (options) {
    this.$options = options;
    initData(this);
    initMethods(this);
    this.$mount(this.$options.el)
}
//挂载 编译原理 AST语法树
Vue.prototype.$mount = function (el) {
    const vnode = this.$options.render.call(this);
    patch(document.querySelector(el), vnode)
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
        title: 'prev'
    },
    render() {
        return h('button', { on: { click: this.someFn } }, this.title)
    },
    methods:{
        someFn:function(){
            console.log(this.title);
        }
    }
})