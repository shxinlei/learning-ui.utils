import XML_CONVERSION from "./conversion/XML_CONVERSION";
import JSON_CONVERSION from "./conversion/JSON_CONVERSION";
import {DataProps} from "./conversion/DataToJson";


class XML {
    private readonly xml_conversion: XML_CONVERSION;
    private readonly json_conversion: JSON_CONVERSION;

    constructor() {
        this.xml_conversion = new XML_CONVERSION();
        this.json_conversion = new JSON_CONVERSION();
    }


    // xml 转 数据
    public parse(f: string) {
        let xmlJson = this.xml_conversion.parseXML(f); // xml 文本 转换为 xml json
        return this.json_conversion.toData(xmlJson); // xml json转数据
    }

    // 数据转 xml
    public parseXML(f: DataProps) {
        let xmlJson = this.json_conversion.toXml(<DataProps>f); // data 数据转 json
        return this.xml_conversion.writeXML(xmlJson); // json 转 xml
    }


    public parseJSON(k: string | DataProps) {
        if (typeof k === "string") {
            return this.xml_conversion.parseXML(k); // xml 转为 xml json
        } else {
            return this.json_conversion.toXml(<DataProps>k); // data 转 xml json
        }
    }
}

export default XML;