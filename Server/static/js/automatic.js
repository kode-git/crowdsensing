

/*
Declaration:
opt : function(stack, i) =>
- stack: dataset to use for optimize range and k
- i: index of point to optimize properties

Aim:
Optimize range and k of an automatic point to manage the spatial-cloaking and finding
the best trade-off between Privacy and QoS
 */

const opt = (stack, data) =>{
    // TODO: Temporal code
    data.properties.neighbour = 3
    data.properties.range = 1000;
    return data
/*
if(data.properties.automatic == false)
    return data

// we need to define k and range in according to stacks elements
let alpha = data.properties.tradeOff
let maxTradeOff = 0
let currTradeOff = 0
let points = []
let x1 = data.geometry.coordinates[0]
let y1 = data.geometry.coordinates[1]
let count;
for(let k = 3; k <= 2; k++) {
    count = 0;
    points = []
    for (let range = 1; range < 3000; range++) {
        for (let i = 0; i < stack.length; i++) {
            let x2 = stack[i].geometry.coordinates[0]
            let y2 = stack[i].geometry.coordinates[1]
            let dist = sc.distance(x1,y1,x2,y2)
            if(dist <= stack[i].properties.range && stack[i].properties.neighbour <= k){
                count++;
                points.push(i)
                if(count == k - 1){
                    break;
                }
            }

        }
        if(count == k - 1)
            break;
    }
    if(count == k){
        // if we are here, we have k in-range points for a dummy spatial position
        currTradeOff = calculateTradeOff(data, points, stack)
    }
}

 */

}


/*
const calculateTradeOff = (points, stack) =>{
let geoJson = []
for(let i = 0; i < points; i++){
    geoJson.push(stack[points[i]])
}

// calculate
}

const max = (collection) =>{
if(collection.length == 0) return -1
let max = collection[0]
for(let i = 0; i < collection.length; i++){
    if(max < collection[i])
        max = collection[i]
}

return max
}
*/
module.exports = {
opt
}
