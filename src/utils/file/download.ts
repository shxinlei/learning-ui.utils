


export interface downloadProps {
    url: string,
    name: string,
    method?: "GET" | "POST",
    progress?: (loaded: number, total: number, event?: any) => void,
    onClose?: (xhr: XMLHttpRequest) => void,
    options?: {
        header?: Record<string , any>,
        data?: Record<string, any> | Record<string, any>[]
        [key: string]: any
    },
    suffix?: string,
    callback?: ({xhr, next} : { xhr: XMLHttpRequest , next: () => void}) => void;
}


const download = ({ url, method='GET', name, progress, onClose,suffix, options  , callback }: downloadProps) => {
    window.URL = window.URL || window.webkitURL;
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.responseType = options?.responseType || "blob";
    
    if(method === "POST" && options?.data) {
        xhr.setRequestHeader('Content-Type', 'application/json');
        
    }

    if(options){
        for (const k in options) {
            if(options.header){
                if (Object.prototype.hasOwnProperty.call(options, k)) {
                    const element = options[k];
                    xhr.setRequestHeader(k, element);
                }
            }
        }
    }
    
    xhr.onprogress = function (event) {
        // if (event.lengthComputable) {
            progress && progress(event.loaded, event.total, event);
        // }
    };
    
    onClose && onClose(xhr);

    const next =  () => {
        let filename = name + '.' + (  suffix ? suffix : url.replace(/(.*\.)/, '')); // 自定义文件名+后缀
        let a = document.createElement('a');
        let blob = new Blob([xhr.response]);
        let _url = window.URL.createObjectURL(blob);
        a.href = _url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(_url);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            if(callback) {
                callback({
                    xhr,
                    next: next
                })
            }else {
                next()
            }
        }
    };
    if(method === "POST" && options?.data) { 
        xhr.send(JSON.stringify(options.data));
    }else {
        xhr.send();
    }
   
}



export default download;