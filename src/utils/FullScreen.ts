

class FullScreen {
    public isFullScreen: boolean;
    public loading: boolean;
    private container: any;


    constructor({ container }: any) {
        this.isFullScreen = false;
        this.loading = false;
        this.container = container
    }


    //进入全屏
    toggleFullscreen () {
        let elem = this.container;

        elem.onfullscreenchange = this.handleFullscreenChange;
        if (!document.fullscreenElement) {
            // @ts-ignore
            if (elem.requestFullscreen) {
                elem.requestFullscreen().then({}).catch((err: any) => {
                    alert(`启用全屏出现错误: ${err.message} (${err.name})`);
                });
            } else {
                console.error("浏览器不支持全屏");
            }

        } else {
            document.exitFullscreen().then(() => new Error("全屏模式退出"))
                .catch((err) => new Error(err));
        }
    };
    //退出全屏
    exitFullscreen = () => {
       this.toggleFullscreen();
    };

    private handleFullscreenChange (e: any) {
        this.loading = true;
        let elem = e.target;
        let isFullscreen = document.fullscreenElement === elem;
        this.isFullScreen = isFullscreen;
        setTimeout(() => {
            this.loading = false;
        }, 300);
    }
}

export default FullScreen;