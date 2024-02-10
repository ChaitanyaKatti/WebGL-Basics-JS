export class PointLight{
    constructor(position, color){
        this.position = position;
        this.color = color;
        this.intensity = 1;
    }

    getStruct(){
        return {
            position: {value: this.position, type: "vec3"},
            color: {value: this.color, type: "vec3"},
            intensity: {value: this.intensity, type: "float"}
        }
    }
}

export class DirectionalLight{
    constructor(direction, color){
        this.direction = direction;
        this.color = color;
        this.intensity = 1;
    }
    
    getStruct(){
        return {
            direction: {value: this.direction, type: "vec3"},
            color: {value: this.color, type: "vec3"},
            intensity: {value: this.intensity, type: "float"}
        }
    }
}

export class SpotLight{
    constructor(position, direction, color){
        this.position = position;
        this.direction = direction;
        this.color = color;
        this.intensity = 1;
        this.innerAngle = Math.PI/4; // in radians
        this.outerAngle = Math.PI/3; // in radians
    }

    getStruct(){
        return {
            position: {value: this.position, type: "vec3"},
            direction: {value: this.direction, type: "vec3"},
            color: {value: this.color, type: "vec3"},
            intensity: {value: this.intensity, type: "float"},
            innerAngle: {value: this.innerAngle, type: "float"},
            outerAngle: {value: this.outerAngle, type: "float"}
        }
    }
}