export const StartEventConfig = {
    width: 40,
    height: 40,
};

export const EndEventConfig = {
    width: 40,
    height: 40,
};

export const ExclusiveGatewayConfig = {
    width: 40,
    height: 40,
};

export const ServiceTaskConfig = {
    width: 100,
    height: 80,
};

export const UserTaskConfig = {
    width: 100,
    height: 80,
};

export const theme = {
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


export const BPMNShape = (BpmnElements: { START: any; END: any; GATEWAY: any; SYSTEM: any; USER: any; }) => {
    let shapeMap = new Map();
    shapeMap.set(BpmnElements.START, {
        width: StartEventConfig.width,
        height: StartEventConfig.height,
    });
    shapeMap.set(BpmnElements.END, {
        width: EndEventConfig.width,
        height: EndEventConfig.height,
    });
    shapeMap.set(BpmnElements.GATEWAY, {
        width: ExclusiveGatewayConfig.width,
        height: ExclusiveGatewayConfig.height,
    });
    shapeMap.set(BpmnElements.SYSTEM, {
        width: ServiceTaskConfig.width,
        height: ServiceTaskConfig.height,
    });
    shapeMap.set(BpmnElements.USER, {
        width: UserTaskConfig.width,
        height: UserTaskConfig.height,
    });

    return shapeMap;
}