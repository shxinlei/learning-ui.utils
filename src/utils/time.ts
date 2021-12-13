

function add0(m: string | number) {
    return m < 10 ? '0' + m : m;
}

export const formatTime = (time: string | number | Date, patter:string[] = ["-" , ":"]):string => {
    let times = new Date(time);
    let y = times.getFullYear();
    let m = times.getMonth() + 1;
    let d = times.getDate();
    let h = times.getHours();
    let mm = times.getMinutes();
    let s = times.getSeconds();
    
    return (
        y +
        patter[0] +
        add0(m) +
        patter[0] +
        add0(d) +
        ' ' +
        add0(h) +
        patter[1] +
        add0(mm) +
        patter[1] +
        add0(s)
    );
}