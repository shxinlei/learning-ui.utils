import SparkMD5 from 'spark-md5';


FileReader.prototype.readAsBinaryString = function (fileData) {
    let binary = '';
    let pt:any = this;
    let reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
        let result = e.target?.result as ArrayBuffer;
        let bytes = new Uint8Array(result);
        let length = bytes.byteLength;
        for (let i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        pt.content = binary;
        pt.onload(pt); //页面内data取pt.content文件内容
    };
    reader.readAsArrayBuffer(fileData);
};

export interface sparkProps {
    file: File,
    onprogress?: (currentChunk: number, chunks: number) => void,
    chunkSize?: number
}

export const sparkMd5File = ({ file, onprogress , ...rest }: sparkProps) =>{
    let _file = file;
    return new Promise((res, rej) => {
        // 拿到file 实例
        //这里假设直接将文件选择框的dom引用传入
        let running = false;

        if (running) {
            return;
        }
        //这里需要用到File的slice( )方法，以下是兼容写法
        let blobSlice = File.prototype.slice, //|| File.prototype?.mozSlice || File.prototype?.webkitSlice,
            file = _file,
            chunkSize = rest.chunkSize || 1048576, //1048576, // 以每片2MB大小来逐次读取
            chunks = Math.ceil(file.size / chunkSize),
            currentChunk = 0,
            spark = new SparkMD5(), //创建SparkMD5的实例
            // time,
            fileReader = new FileReader();

        fileReader.onload = function (e: any) {
            //     of  chunks ");
            spark.appendBinary(e.content); // append array buffer
            currentChunk += 1;
            // message.loading({ content: `正在分割文件...进度${Math.ceil((currentChunk/chunks) * 100)}%`, key: "1" });
            // console.warn(currentChunk/chunks , 'currentChunk/chunks');
            if (currentChunk < chunks) {
                onprogress && onprogress(currentChunk + 1 , chunks);
                loadNext();
            } else {
                // message.success({ content: "分割完成", key: "1", duration: 2 });
                running = false;
                res(spark.end()); // 完成计算，返回结果
            }
        };

        fileReader.onerror = function () {
            running = false;
            //    ;
            rej('something went wrong');
        };

        function loadNext() {
            let start = currentChunk * chunkSize,
                end =
                    start + chunkSize >= file.size
                        ? file.size
                        : start + chunkSize;

            fileReader.readAsBinaryString(blobSlice.call(file, start, end));
        }

        running = true;
        loadNext();
    });
}
 
interface uploadFileProps {
    files: File[],
    onprogress?: (current: number, total: number,filesLength: number , currentLength: number ,  obj: any) => void;
    chunkSize?: number;
    [key: string]: any
}


/**
 * 上传文件
 * @params {{ files: File[] ,onprogress: func , chunkSize?: number } }
 * @returns Promise<string[]>
 */
export const uploadFileMd5: ({ files, onprogress, ...rest }: uploadFileProps) => Promise<string[]> = ({ files, onprogress, ...rest }) => new Promise((resolve) => {
        md5FileUpload({
            ...rest,
            files,
            onprogress, 
            resolve,
        })
});


const md5FileUpload = ({files, onprogress , resolve, ...rest}: any) => {
    let obj = rest.obj || {};
    let index = rest.ex || 0;
    let md5Arr = rest.md5Arr || {};
    sparkMd5File({
        file: files[index],
        onprogress: (current: number, total: number) => {
            obj[files[index].name] = [current, total];
            onprogress && onprogress(current, total, files.length, Object.keys(obj).length , obj)
        },
        chunkSize: rest.chunkSize
    }).then(md5 => {

        md5Arr[files[index].name] = md5;
        index = index + 1;

        if (Object.keys(md5Arr).length !== files.length) {
            md5FileUpload({
                ...rest,
                ex: index,
                obj: obj,
                md5Arr: md5Arr,
                files: files,
                onprogress: onprogress,
                resolve
            })
        }else {
            resolve(md5Arr)
        }
    })
}
