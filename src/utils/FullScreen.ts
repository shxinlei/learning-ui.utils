
interface ToggleFull { success?: (str: string) => void; error?: (str: string) => void; }
class FullScreen {
    public isFullScreen: boolean;
    private container: any;

    constructor({ container }: any) {
        this.isFullScreen = false;
        this.container = container
    }

    //进入全屏
    public toggleFullscreen (callback?: ToggleFull) {
        let elem = this.container;
        elem.onfullscreenchange = this.handleFullscreenChange;
        if (!document.fullscreenElement) {
            // @ts-ignore
            if (elem.requestFullscreen) {
                elem.requestFullscreen().then(() => {
                    callback && callback.success && callback.success("打开全屏成功");
                }).catch((err: Error) => {
                    console.warn(`启用全屏出现错误: ${err.message} (${err.name})`);
                    callback && callback.error && callback.error(`启用全屏出现错误: ${err.message} (${err.name})`);
                });
            } else {
                console.warn("浏览器不支持全屏");
                callback && callback.error && callback.error("浏览器不支持全屏");
            }

        } else {
            document.exitFullscreen().then(() => {
                callback && callback.success && callback.success("退出全屏成功");
            })
                .catch((err) => new Error(err));
        }
    }
   

    private handleFullscreenChange (e: any) {
        let elem = e.target;
        this.isFullScreen = document.fullscreenElement === elem;
    }


}

export default FullScreen;