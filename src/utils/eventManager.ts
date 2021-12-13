



/**
 * 事件管理
 *
 * ------使用方式------
 * 1、添加事件监听：
 *  eventManager.on('timeChange',function(){
 *      alert('Time is change!');
 *  });
 *
 * 2、触发指定事件监听：
 *  eventManager.emit('timeChange',...args);
 *
 * @type {{events: {}, on: Function, emit: Function, off: Function}}
 */

const eventManager: {
    events: any;
    on: (name: string | number, fn: any) => any;
    once: (name: string | number, fn: any) => any;
    emit: (name: string | number, context?: any) => any;
    emitOnce: (name: string | number,context?: any) => any;
    back: (name: string | number) => any[];
    off: (name: string | number, fn: any) => any;
} = {
    /**
     * 存储事件监听信息
     */
    events: {},
    /**
     * 添加监听
     * @param name
     * @param fn
     */
    on: function (name: string | number, fn: any) {
        // fn.context = context;
        this.events[name] = this.events[name] || [];
        if (this.events[name] instanceof Array) {
            if (this.events[name].indexOf(fn) === -1) {
                this.events[name].push(fn);
            }
        } else {
            this.events[name] = [].concat(fn);
        }
        return this;
    },
    once: function (name: string | number, fn: any) {
        // fn.context = context;
        this.events[name] = this.events[name] || [];
        this.events[name] = fn;
        return this;
    },
    /**
     * 触发事件
     * @param name
     * @returns {Event}
     */
    emit: function (name: string | number) {
        let args = Array.prototype.slice.call(arguments);
        args.shift();
        this.events[name].forEach((cb: { apply: (arg0: any, arg1: any[]) => void; context: any; }) => {
            cb.apply(cb.context || null, args);
        });
        return this;
    },
    emitOnce: function (name: string | number) {
        let args = Array.prototype.slice.call(arguments);
        args.shift();
        this.events[name].apply(this.events[name].context || null, args);
        return this;
    },
    back: function (name: string | number) {
        let results = [];
        if (name) {
            let fns = this.events[name] || [];
            let params = [].slice.call(arguments, 1);
            for (let i = 0, l = fns.length; i < l; i++) {
                let da = fns[i].apply(this, params);
                results.push(da);
            }
        }
        return results;
    },
    /**
     * 移除事件监听
     * @param name
     * @param fn
     * @returns {eventManager}
     */
    off: function (name: string | number, fn: any) {
        if (fn) {
            let index = (this.events[name] || []).indexOf(fn);
            if (index > -1) {
                this.events[name].splice(index, 1);
            }
        } else {
            delete this.events[name];
        }
        return this;
    },
};


export default eventManager;