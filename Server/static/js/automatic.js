

/*
Declaration:
opt : function(stack, i) =>
- stack: dataset to use for optimize range and k
- i: index of point to optimize properties

Aim:
Optimize range and k of an automatic point to manage the spatial-cloaking and finding
the best trade-off between Privacy and QoS
 */

const opt = (data) =>{
    if(!data.properties.automatic){
        // it's not an automatic configuration, so we have already
        // parameters for k and range in data
        return data
    }
    // it's an automatic point, we can catch the alpha and round it
    let alpha = data.properties.alpha
    // we need to setup k and range based on the alpha value
    let k = undefined
    // rounded range
    let range = Math.floor(alpha * 3000 * 10 / 10)
    if(alpha == 0) k = 1
    else {
        if(alpha <= 0.5) k = 2
        else k = 3
    }
    if(k == undefined) k = 1
    data.properties.neighbour = k
    data.properties.range = range
    return data


}


module.exports = {
opt
}
