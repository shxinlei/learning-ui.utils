import {isEqual, uuid , scrollHandel} from "./utils"
import eventManager from "./utils/eventManager"
import download from "./utils/file/download"
import { formatTime } from "./utils/time"
import { formDeepClone } from "./utils"
import { uploadFileMd5 , sparkMd5File } from "./utils/file/upload"
import ObjectUtils from "./utils/ObjectUtils"
import ArrayUtils from "./utils/ArrayUtils"
import FullScreen from "./utils/FullScreen"

import XML from "./utils/XML";

export {
    isEqual,
    uuid,

    uploadFileMd5,
    sparkMd5File,
    download,

    scrollHandel,
    formDeepClone,
    formatTime,

    ObjectUtils,
    ArrayUtils,
    eventManager,

    XML,
    FullScreen,
}

