import Dep, {pushTarget, popTarget} from './dep'
import { parsePath } from './parsePath';
let uid = 0
 
export default function Watcher(vm, expOrFn,cb, options) {
  this.id = ++uid // uid for batching
  this.expOrFn = expOrFn;
  this.vm = vm;
  this.deps = []
  this.depIds = new Set();
  this.cb = cb;
  if (options) {
    this.user = !!options.user;// new vue({watch:{}})
    this.lazy = !!options.lazy;
    
  } else {
    this.user = this.lazy = false
  }
 
  this.dirty = this.lazy // 用于渲染时不把计算watcher设置成Dep.target
  // 此处为了触发属性的getter，从而在dep添加自己，结合Observer更易理解
  this.getter = typeof expOrFn === 'function' ? this.expOrFn : parsePath(expOrFn);
  this.value = this.lazy ? undefined :this.get();
  
}
 
Watcher.prototype.get = function() {
  let value;
  pushTarget(this)
  
  // if (this.dirty) Dep.target = this
  // Dep.target = computedWatcher
  value = this.getter.call(this.vm,this.vm);
  // if (this.dirty) Dep.target = null
  popTarget();
  return value
}
 
Watcher.prototype.update = function() {
  //清楚computed watcher的缓存
  if (this.lazy) {
    this.dirty = true;
  } else {
    this.run();
  }
}
 
Watcher.prototype.addDep = function(dep) {
  const id = dep.id
  if (!this.depIds.has(id)) {
    //this.deps.push (this.num dep)
    this.deps.push(dep)
    this.depIds.add(id)
    dep.addSub(this);
    //this.num dep.sub.push +  computedWatcher
  }
}
 
Watcher.prototype.evaluate = function() {
  this.value = this.get()
  this.dirty = false
}
 
Watcher.prototype.depend = function() {
  let i = this.deps.length
  while (i--) {
    this.deps[i].depend()
  }
}
Watcher.prototype.run = function(){
  const value = this.get();
  if(value !== this.value){
    const oldValue = this.value
    this.value = value
    this.cb.call(this.vm,value,oldValue);
    console.log(this.cb);
  }
}
//watch 实现原理
//初始化时 创建了num的watchWatcher num和watchMsg的observe
//把watchWatcher添加到num的Dep中
// set => update => run 找到 num的新值 把新旧值传给this.cb 
// 改变了this.watchMsg 触发updateComponent
// parsePath 用于创建获取num的对象:Vue['num']

