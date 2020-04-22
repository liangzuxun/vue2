
import Dep from './dep'
 
let uid = 0;
export default function Watcher(vm, cb) {
  this.id = ++uid;
  this.cb = cb;
  this.vm = vm;
  // 此处为了触发属性的getter，从而在dep添加自己，结合Observer更易理解
  //其实只是为了改变Dep.target的值
  // 以及更新视图
  //真正的属性的getter在render中
  this.value = this.get(); 
}
 
Watcher.prototype.get = function() {
  Dep.target = this
  this.cb.call(this.vm)
  Dep.target = null
}
 
Watcher.prototype.update = function() {
  return this.get(); 
}