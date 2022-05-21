import XML_CONVERSION from "./conversion/XML_CONVERSION";
import JSON_CONVERSION from "./conversion/JSON_CONVERSION";
import {DataProps} from "./conversion/DataToJson";


class XML {
    private readonly xml_conversion: XML_CONVERSION;
    private readonly json_conversion: JSON_CONVERSION;
    private readonly xmlDecl: string;
    constructor() {
        this.xml_conversion = new XML_CONVERSION();
        this.json_conversion = new JSON_CONVERSION();
	    this.xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>';
    }


    // xml 转 数据 xml => json => data
    public parseData(f: string) {
       let json = this.xml_conversion.parseXML(f) // 转为 json
       return this.json_conversion.toData(json);
    }

    // 数据 转 xml  data => json => xml
    public parseXML(f: DataProps) {
        let json = this.json_conversion.toJSON(f);
        return this.xmlDecl + this.xml_conversion.writeXML(json);
    }


    public parseJSON(k: string | DataProps) {
        if(typeof k === "string"){
            return this.xml_conversion.parseXML(k)
        }else {
            return this.xml_conversion.writeXML(k);
        }
    }
}

export default XML;