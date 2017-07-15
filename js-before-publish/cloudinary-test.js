export default (request) => { 
    const cloudName = request.message.cloudName;
    const fileName = request.message.image;
    const transformations = request.message.transformations;
    const resource = request.message.resource;
    const operation = request.message.operation;
    
    let apiUrl = 'http://res.cloudinary.com/' +
       cloudName + '/' + resource + '/' + operation + '/';
    if(transformations && transformations.length > 0) {
       apiUrl += transformations.join(',') + '/';
    }
    apiUrl += fileName;
    
    request.message.cloudinaryLink = apiUrl;
    console.log("request = ", request);
    return request.ok();
}