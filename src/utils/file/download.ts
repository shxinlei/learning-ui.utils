


export interface downloadProps {
    url: string,
    name: string,
    method?: "GET" | "POST",
    progress?: (loaded: number, total: number, event?: any) => void,
    onClose?: (xhr: XMLHttpRequest) => void,
    options?: {
        [key: string]: any
    }
}


const download = ({ url, method='GET', name, progress, onClose, options }: downloadProps) => {
    window.URL = window.URL || window.webkitURL;
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.responseType = options?.responseType || "blob";
    
    if(options){
        for (const k in options) {
            if (Object.prototype.hasOwnProperty.call(options, k)) {
                const element = options[k];
                xhr.setRequestHeader(k, element);
            }
        }
    }
    
    xhr.onprogress = function (event) {
        if (event.lengthComputable) {
            progress && progress(event.loaded, event.total, event);
        }
    };
    onClose && onClose(xhr);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let filename = name + '.' + url.replace(/(.*\.)/, ''); // 自定义文件名+后缀

            let a = document.createElement('a');
            let blob = new Blob([xhr.response]);
            let _url = window.URL.createObjectURL(blob);
            a.href = _url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(_url);

        }
    };
    xhr.send();
}

export default download;