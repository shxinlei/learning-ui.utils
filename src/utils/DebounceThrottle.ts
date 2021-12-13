

interface debounceProps<T>{
    context?: T,
    func: Function, 
    wait: number, 
    immediate?: boolean;
}


class DebounceThrottle {

    timer: NodeJS.Timeout | null = null;
    /**
     * 防抖
     */
    debounce<T>({ context, func, wait = 300, immediate }:debounceProps<T>) {
        if (this.timer) clearTimeout(this.timer);

        if (immediate) {
            let calls = !this.timer;
            this.timer = setTimeout(() => {
                this.timer = null;
            }, wait)
            if(calls) func && func(context);
        } else {
            this.timer = setTimeout(() => {
                func && func(context);
            }, wait)
        }
    }
    /**
     * 节流
     */
    throttle<T>({ context , func , wait = 300 , immediate }: debounceProps<T>){
        if(immediate){
            console.warn("你设置立即执行参数, 节流函数将无意义, 建议直接执行 'func'");
            return func && func(context)
        }else {
            if(this.timer) return console.warn("参数 'func' 未到达执行时间");
            this.timer = setTimeout(() => {
                func && func(context);
                this.timer = null;
            }, wait);
        }
    }
}
let debounce = new DebounceThrottle().debounce;
let throttle = new DebounceThrottle().throttle;
export {
    debounce,
    throttle
}