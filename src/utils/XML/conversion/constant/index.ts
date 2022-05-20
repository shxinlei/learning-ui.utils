import {BPMN_ELEMENTS} from "./Properties";

export class BPMNShape {
    public BPMNShape: Map<any, any>;
    private StartEventConfig = {
        width: 40,
        height: 40,
    };
    private EndEventConfig = {
        width: 40,
        height: 40,
    }
    private ExclusiveGatewayConfig = {
        width: 40,
        height: 40,
    };
    private ServiceTaskConfig = {
        width: 100,
        height: 80,
    };
    private UserTaskConfig = {
        width: 100,
        height: 80,
    };
    public static theme = {
        rect: {
            radius: 5,
            stroke: 'rgb(24, 125, 255)',
        },
        circle: {
            r: 18,
            stroke: 'rgb(24, 125, 255)',
        },
        polygon: {
            stroke: 'rgb(24, 125, 255)',
        },
        polyline: {
            stroke: 'rgb(24, 125, 255)',
            hoverStroke: 'rgb(24, 125, 255)',
            selectedStroke: 'rgb(24, 125, 255)',
        },
        edgeText: {
            background: {
                fill: 'white',
                height: 14,
                stroke: 'transparent',
                radius: 3,
            },
        },
    };

    constructor() {
        this.BPMNShape = new Map();
        this.BPMNShape.set(BPMN_ELEMENTS.START, {
            width: this.StartEventConfig.width,
            height: this.StartEventConfig.height,
        });
        this.BPMNShape.set(BPMN_ELEMENTS.END, {
            width: this.EndEventConfig.width,
            height: this.EndEventConfig.height,
        });
        this.BPMNShape.set(BPMN_ELEMENTS.GATEWAY, {
            width: this.ExclusiveGatewayConfig.width,
            height: this.ExclusiveGatewayConfig.height,
        });
        this.BPMNShape.set(BPMN_ELEMENTS.SYSTEM, {
            width: this.ServiceTaskConfig.width,
            height: this.ServiceTaskConfig.height,
        });
        this.BPMNShape.set(BPMN_ELEMENTS.USER, {
            width: this.UserTaskConfig.width,
            height: this.UserTaskConfig.height,
        });
    }
}
