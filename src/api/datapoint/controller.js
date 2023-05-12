const DataPoint = require('../../database/models/datapoint.model');
const Log = require('../../database/models/log.model');
const User = require('../../database/models/user.model');
const DataPointLog = require('../../database/models/datapointlog.model');
const OrganizationModel = require('../../database/models/organization.model');
// const LocationModel = require('../../database/models/location.model');
const StorageUtils = require('../../utils/azure-storage');

const logger = require('../../utils/logger');
const { ObjectId } = require('mongodb');
// Autodeployment function
const msRestNodeAuth = require("@azure/ms-rest-nodeauth");
const ci = require("@azure/arm-containerinstance");
const { FrontDoors, FrontDoorManagementClientContext } = require("@azure/arm-frontdoor");
const fetch = require('node-fetch');

const uuid = require('uuid');
const { 
    DEFAULT_AZURE_SUBSCRIPTIONID,
    DEFAULT_AZURE_CLIENTID,
    DEFAULT_AZURE_DOMAIN, 
    DEFAULT_AZURE_SECRET,
    LOCATIONS,
    STORAGE_ACCOUNT_NAME,
    STORAGE_ACCOUNT_KEY,
} = require("../../config/config");
// australiaeast,australiasoutheast,brazilsouth,canadacentral,canadaeast,centralindia,centralus,eastasia,eastus,eastus2,francecentral,germanywestcentral,japaneast,koreacentral,northcentralus,northeurope,norwayeast,southcentralus,southeastasia,southindia,switzerlandnorth,uaenorth,uksouth,ukwest,westcentralus,westeurope,westus,westus2'

async function autoDeployFDP(backend_ciName, frontend_ciName, location) {
    // console.log(client, DEFAULT_AZURE_SECRET, DEFAULT_AZURE_DOMAIN)
    // const locations = await LocationModel.find({region: location});
    let dnsNamelabel_be, dnsNamelabel_fe, shareNameFDP, shareNameMongo, shareNameBlaze, fdName;
    let timestamp = "" + (Date.now());
    let subsciption = DEFAULT_AZURE_SUBSCRIPTIONID;

    dnsNamelabel_be = "fdpbe" + timestamp;
    dnsNamelabel_fe = "fdpfe" + timestamp;
    shareNameFDP = "fdp" + timestamp;
    shareNameMongo = "mongo" + timestamp;
    shareNameBlaze = "blaze" + timestamp;
    fdName = "fairsolution"+timestamp;
    try{
        // await StorageUtils.createShareAndDir(shareNameFDP, "fdp");
        await StorageUtils.createShareAndDir(shareNameMongo, "data");
        await StorageUtils.createShareAndDir(shareNameBlaze, "blaze-data");
    }catch(err){
        console.log(err.message);
        return {
            code: 0,
            msg: "Failed creating volumes." + err.message,
        }
    }
    const rg = "RnD-rg";
    const rgList = await listByRG(rg);

    let locations = LOCATIONS[location];
    let i, location_map = {}, location_names = [];
    for(i = 0 ; i < locations.length ; i ++){
        location_map[locations[i]] = 0;
    }

    for(i = 0 ; i < rgList.length ; i ++){
        for(let j = 0 ; j < locations.length ; j ++){
            if(rgList[i].location == locations[j]){
                location_map[rgList[i].location] += rgList[i].containers.length
            }    
        }
    }

    for(i = 0 ; i < locations.length ; i ++){
        // if(locations[i] == "norwayeast") continue;
        if(location_map[locations[i]] < 7) {
            break;
        }
    }

    if(i == locations.length){
        return {
            code: 0,
            msg: `Failed, 'StandardCores' exceeded in region '${location}' \nPlease change location.`
        }
    }

    const be_ciName = backend_ciName; //"test-ci-fdp-03";
    const fe_ciName = frontend_ciName; //"test-ci-fdp-client-03";
    const fdp_be = {
        image: "zhengguo107/fairdatapoint:2",
        name: "fdp",
        resources: {
            requests: {
            cpu: 1,
            memoryInGB: 1.5,
            },
        },
        ports: [
            {
                port: 80,
                protocol: "TCP"
            }
        ],
        // volumeMounts: [
        //     {
        //       mountPath: "/fdp",
        //       name: "fdp"
        //     }
        // ]
    }
    const fdp_db= {
        image: "mongo:4.0.12",
        name: "mongo",
        resources: {
            requests: {
            cpu: 1,
            memoryInGB: 1.5,
            },
        },
        ports: [
            {
            port: 27017,
            protocol: "TCP"
            }
        ],
        command: ['mongod', '--dbpath', '/data/mongodb'],
        volumeMounts: [
            {
              mountPath: "/data/mongodb",
              name: "mongo"
            }
        ],
    };
    const fdp_blaze= {
        image: "metaphacts/blazegraph-basic:2.2.0-20160908.003514-6",
        name: "blazegraph",
        resources: {
            requests: {
                cpu: 1,
                memoryInGB: 1.5,
            },
        },
        ports: [
            {
                port: 8888,
                protocol: "TCP"
            }
        ],
        volumeMounts: [
            {
              mountPath: "/blazegraph-data",
              name: "blaze"
            }
        ]
    };
    const containerGroupParams = {
        ipAddress: {
            dnsNameLabel: dnsNamelabel_be, //"fdpcibe",
            type: "Public",
            ports: [
                {
                    port: 80,
                    protocol: "TCP"
                },
                {
                    port: 27017,
                    protocol: "TCP"
                },
                {
                    port: 8888,
                    protocol: "TCP"
                }
            ]
        },
        location: locations[i], //"westeurope",
        osType: "Linux",
        restartPolicy: "OnFailure",
        sku: "Standard",
        // containers: [containers],
        containers: [fdp_db, fdp_blaze, fdp_be],
        volumes: [
            // {
            //     azureFile: {
            //         readOnly: false,
            //         shareName: shareNameFDP,
            //         storageAccountKey: STORAGE_ACCOUNT_KEY,
            //         storageAccountName: STORAGE_ACCOUNT_NAME
            //     },
            //     name: "fdp"
            // },
            {
                azureFile: {
                    readOnly: false,
                    shareName: shareNameMongo,
                    storageAccountKey: STORAGE_ACCOUNT_KEY,
                    storageAccountName: STORAGE_ACCOUNT_NAME
                },
                name: "mongo"
            },
            {
                azureFile: {
                    readOnly: false,
                    shareName: shareNameBlaze,
                    storageAccountKey: STORAGE_ACCOUNT_KEY,
                    storageAccountName: STORAGE_ACCOUNT_NAME
                },
                name: "blaze"
            },
        ]
    };
    // await LocationModel.updateLocationData({_id: locations[i]._id}, {count: locations[i].count+2});

    const creds = await msRestNodeAuth.loginWithServicePrincipalSecret(DEFAULT_AZURE_CLIENTID, DEFAULT_AZURE_SECRET, DEFAULT_AZURE_DOMAIN);
    const context = new ci.ContainerInstanceManagementClientContext(creds, DEFAULT_AZURE_SUBSCRIPTIONID);
    const containersGroup = new ci.ContainerGroups(context);
    const resourceJson = await containersGroup.beginCreateOrUpdate(rg, be_ciName, containerGroupParams);
    console.log(resourceJson._initialResponse.parsedBody.ipAddress);
    const fdp_fe = {
        image: "fairdata/fairdatapoint-client:1.8.0",
        name: "fdp-client",
        resources: {
            requests: {
                cpu: 1,
                memoryInGB: 1.5,
            },
        },
        ports: [
            {
                port: 80,
                protocol: "TCP"
            }
        ],
        environmentVariables: [
            {
                name: "FDP_HOST",
                value: resourceJson._initialResponse.parsedBody.ipAddress.fqdn
            }
        ]
    }
    const containerGroupParams1 = {
        ipAddress: {
            dnsNameLabel: dnsNamelabel_fe, //"fdpcife",
            type: "Public",
            ports: [
                {
                    port: 80,
                    protocol: "TCP"
                },
            ]
        },
        location: locations[i], //"westeurope",
        osType: "Linux",
        restartPolicy: "OnFailure",
        sku: "Standard",
        // containers: [containers],
        containers: [fdp_fe]
    };
    // await LocationModel.updateLocationData({_id: locations[i]._id}, {count: locations[i].count+1});
    const resourceJson1 = await containersGroup.beginCreateOrUpdate(rg, fe_ciName, containerGroupParams1);
    console.log(resourceJson1._initialResponse.parsedBody.ipAddress);
    const frontDoorParameters = {
        location: "global",
        routingRules: [
          {
            name: "routingRule1",
            frontendEndpoints: [
              {
                id: `/subscriptions/${subsciption}/resourceGroups/${rg}/providers/Microsoft.Network/frontDoors/${fdName}/frontendEndpoints/frontendEndpoint1`
              }
            ],
            acceptedProtocols: [
              "Https"
            ],
            patternsToMatch: [
              "/*"
            ],
            routeConfiguration: {
              odatatype: "#Microsoft.Azure.FrontDoor.Models.FrontdoorForwardingConfiguration",
              backendPool: {
                id: `/subscriptions/${subsciption}/resourceGroups/${rg}/providers/Microsoft.Network/frontDoors/${fdName}/backendPools/backendPool1`
              },
              forwardingProtocol: "HttpOnly",
            },
            enabledState: "Enabled"
          }
        ],
        healthProbeSettings: [
          {
            name: "healthProbeSettings1",
            path: "/",
            protocol: "Https",
            intervalInSeconds: 30,
            enabledState: "Enabled",
            healthProbeMethod: "HEAD"
          }
        ],
        loadBalancingSettings: [
          {
            name: "loadBalancingSettings1",
            sampleSize: 4,
            successfulSamplesRequired: 2
          }
        ],
        backendPools: [
          {
            name: "backendPool1",
            backends: [
              {
                address: resourceJson1._initialResponse.parsedBody.ipAddress.fqdn,
                httpPort: 80,
                httpsPort: 443,
                weight: 50,
                priority: 1,
                backendHostHeader: resourceJson1._initialResponse.parsedBody.ipAddress.fqdn
              },
            ],
            loadBalancingSettings: {
              id: `/subscriptions/${subsciption}/resourceGroups/${rg}/providers/Microsoft.Network/frontDoors/${fdName}/loadBalancingSettings/loadBalancingSettings1`
            },
            healthProbeSettings: {
              id: `/subscriptions/${subsciption}/resourceGroups/${rg}/providers/Microsoft.Network/frontDoors/${fdName}/healthProbeSettings/healthProbeSettings1`
            }
          }
        ],
        frontendEndpoints: [
            {
                name: "frontendEndpoint1",
                hostName: `${fdName}.azurefd.net`
            }
        ],
        // "backendPoolsSettings": {
        //   "enforceCertificateNameCheck": "Enabled",
        //   "sendRecvTimeoutSeconds": 60
        // },
        enabledState: "Enabled"
    }
    const fdClientContext = new FrontDoorManagementClientContext(creds, subsciption);
    const frontDoors = new FrontDoors(fdClientContext);
    await frontDoors.beginCreateOrUpdate(rg, fdName, frontDoorParameters);
    console.log("FrontDoor is set")
    return {
        code: 1,
        data: resourceJson1._initialResponse.parsedBody.ipAddress,
        shareNameBlaze: shareNameBlaze,
        shareNameFDP: shareNameFDP,
        shareNameMongo: shareNameMongo,
        frontDoor: `${fdName}.azurefd.net`
    };
}
async function getPropertiesOfRG(rgName, cgName) {
    const creds = await msRestNodeAuth.loginWithServicePrincipalSecret(DEFAULT_AZURE_CLIENTID, DEFAULT_AZURE_SECRET, DEFAULT_AZURE_DOMAIN);
    const context = new ci.ContainerInstanceManagementClientContext(creds, DEFAULT_AZURE_SUBSCRIPTIONID);
    const containersGroup = new ci.ContainerGroups(context);
    const resourceJson = await containersGroup.get(rgName, cgName);
    return resourceJson;
}
async function listByRG(rgName) {
    const creds = await msRestNodeAuth.loginWithServicePrincipalSecret(DEFAULT_AZURE_CLIENTID, DEFAULT_AZURE_SECRET, DEFAULT_AZURE_DOMAIN);
    const context = new ci.ContainerInstanceManagementClientContext(creds, DEFAULT_AZURE_SUBSCRIPTIONID);
    const containersGroup = new ci.ContainerGroups(context);
    const resourceJson = await containersGroup.listByResourceGroup(rgName);
    return resourceJson;
}
// const createDataPoint = async (req, res) => {
//     logger.info("Create Datapoint");
//     const dp = req.body;
//     const { engineUser } = req;

//     if(engineUser.status == "Inactive"){
//         res.status(200).send({
//             code: 0,
//             msg: "Failed, permission denied."
//         })
//         return;
//     }

//     dp.OrganizationId = engineUser.organizationId;
//     dp.CreatedBy = engineUser._id;
//     dp.Version = "1.8.0";
//     dp.Status = "Active";
//     const org = await OrganizationModel.find({_id: ObjectId(engineUser.organizationId)});
//     dp.Country = org.Country;

//     let backend_ciName, frontend_ciName, location, dnsNamelabel_be, dnsNamelabel_fe, datapointCount;
//     backend_ciName = uuid.v4();
//     frontend_ciName = uuid.v4();
//     dp.BeCiName = ""+backend_ciName;
//     dp.FeCiName = ""+frontend_ciName;

//     if(dp.Region.toLowerCase() == "europe"){
//         location = "europe"
//     }else if(dp.Region.toLowerCase() == "us"){
//         location = "us"
//     }else{
//         location = "asia"
//     }
//     // location = dp.Region.toLowerCase();
//     datapointCount = await DataPoint.find({}).count();
    
//     dnsNamelabel_be = "fdpbe"+(Date.now());
//     dnsNamelabel_fe = "fdpfe"+(Date.now());
//     // auto deployment
//     try{
//         let resAzure = await autoDeployFDP(backend_ciName, frontend_ciName, location, dnsNamelabel_be, dnsNamelabel_fe);
//         if(resAzure.code == 0){
//             res.status(200).send({
//                 code: 0,
//                 msg: `Failed, 'StandardCores' exceeded in region '${location}' \nPlease change location.`
//             })
//             return;    
//         }
//         dp.DeployedLink = resAzure.data.fqdn;    
//     }catch(err){
//         console.log(err);
//         res.status(200).send({
//             code: 0,
//             msg: `Failed, 'StandardCores' exceeded in region '${location}' \nPlease change location.`
//         })
//         return;
//     }
//     const savedDP = await DataPoint.createDataPoint(dp);
//     await Log.createLog({
//         UserId: engineUser._id,
//         Activity: "Datapoint Creation",
//         Content: "Success",
//     })
//     await DataPointLog.createLog({
//         UserId: engineUser._id,
//         DataPointId: savedDP._id,
//         Activity: "Datapoint Creation",
//         Content: "Success",
//     })
//     res.status(200).send({
//         code: 1,
//         msg: "Create DataPoint Success",
//         data: {
//             "DataPoint": savedDP
//         }
//     })
// }

const createDataPoint = async (req, res) => {
    logger.info("Create Datapoint");
    const dp = req.body;
    const { engineUser } = req;

    if(engineUser.status == "Inactive"){
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied."
        })
        return;
    }

    dp.OrganizationId = engineUser.organizationId;
    dp.CreatedBy = engineUser._id;
    dp.Version = "1.8.0";
    dp.Status = "Deploying";
    const org = await OrganizationModel.find({_id: ObjectId(engineUser.organizationId)});
    dp.Country = org.Country;

    let backend_ciName, frontend_ciName, location, datapointCount;
    backend_ciName = uuid.v4();
    frontend_ciName = uuid.v4();
    dp.BeCiName = ""+backend_ciName;
    dp.FeCiName = ""+frontend_ciName;

    if(dp.Region.toLowerCase() == "europe"){
        location = "europe"
    }else if(dp.Region.toLowerCase() == "us"){
        location = "us"
    }else{
        location = "asia"
    }
    // location = dp.Region.toLowerCase();
    datapointCount = await DataPoint.find({}).count();

    const savedDP = await DataPoint.createDataPoint(dp);
    await Log.createLog({
        UserId: engineUser._id,
        Activity: "Datapoint Created",
        Content: "Success",
    })
    await DataPointLog.createLog({
        UserId: engineUser._id,
        DataPointId: savedDP._id,
        Activity: "Datapoint Created",
        Content: "Success",
    })

    res.status(200).send({
        code: 1,
        msg: "Datapoint Created",
        data: savedDP,
    })

    // auto deployment
    /*
    try{
        let resAzure = await autoDeployFDP(backend_ciName, frontend_ciName, location, dnsNamelabel_be, dnsNamelabel_fe);
        if(resAzure.code == 0){
            res.status(200).send({
                code: 0,
                msg: `Failed, 'StandardCores' exceeded in region '${location}' \nPlease change location.`
            })
            return;    
        }
        dp.DeployedLink = resAzure.data.fqdn;    
    }catch(err){
        console.log(err);
        res.status(200).send({
            code: 0,
            msg: `Failed, 'StandardCores' exceeded in region '${location}' \nPlease change location.`
        })
        return;
    }
    */
    try{
        let resAzure = await autoDeployFDP(backend_ciName, frontend_ciName, location);
        if(resAzure.code == 0){
            await Log.createLog({
                UserId: engineUser._id,
                Activity: "Datapoint Created",
                Content: resAzure.msg,
            })
            await DataPointLog.createLog({
                UserId: engineUser._id,
                DataPointId: savedDP._id,
                Activity: "Datapoint Created",
                Content: resAzure.msg,
            })
            return;
        }
        savedDP.DeployedLink = resAzure.frontDoor;
        savedDP.SharedFDPName = resAzure.shareNameFDP;
        savedDP.SharedMongoName = resAzure.shareNameMongo;
        savedDP.SharedBlazeName = resAzure.shareNameBlaze;
        // savedDP.Status = "Active";
        DataPoint.save1(savedDP);
    }catch(err){
        console.log(err.message);
        await Log.createLog({
            UserId: engineUser._id,
            Activity: "Datapoint Created",
            Content: "Failed, Error:" + err.message,
        })
        await DataPointLog.createLog({
            UserId: engineUser._id,
            DataPointId: savedDP._id,
            Activity: "Datapoint Created",
            Content: "Failed, Error:" + err.message,
        })
    }
}

const getDataPointStatus = async (req, res) => {
    // logger.info("Get Status of DataPoint");
    // console.log(req.body);
    const {CGNameBE, CGNameFE} = req.body;
    const RGName = "RnD-rg";
    let resJsonBE, resJsonFE, i;
    let datapoint = await DataPoint.findOne({FeCiName: CGNameFE});
    try{
        resJsonBE = await getPropertiesOfRG(RGName, CGNameBE);
        resJsonFE = await getPropertiesOfRG(RGName, CGNameFE);    
    }catch(err){
        console.log(err.message);
        res.status(200).send({
            code: 0,
            msg: "Deployed instance name incorrect, please wait for a while...",
        })
        return;
    }

    const beContainers = resJsonBE.containers;
    const feContainers = resJsonFE.containers;
    let status = [];
    try{
        for(let i = 0 ; i < beContainers.length ; i ++){
            status.push(beContainers[i].instanceView.currentState);
        }
        for(i = 0 ; i < feContainers.length ; i ++){
            status.push(feContainers[i].instanceView.currentState);
        }
    
        for(i = 0 ; i < status.length ; i ++){
            if(status[i].state != "Running"){
                break;
            }
        }    
    }catch(err){
        res.status(200).send({
            code: 1, 
            msg: "Not deployed or started yet, please wait for a while...",
            data: {
                status: "Not deployed or started yet, please wait for a while..."
            }
        })
        return;
    }
    // console.log(status);
    if(i == status.length) {
        // res.status(200).send({
        //     code: 1,
        //     msg: "Success",
        //     data: {
        //         status: "Running...",
        //         link: datapoint.DeployedLink,
        //     }
        // })
        let resJson2 = await fetch(`https://${datapoint.DeployedLink}`);
        console.log(resJson2.status, resJson2.headers.get("x-azure-ref"));
        let azureRef = resJson2.headers.get("x-azure-ref")
        if(resJson2.status == 404 || resJson2.status == 200){
            if(azureRef == null || azureRef == undefined){
                res.status(200).send({
                    code: 1,
                    msg: "Success",
                    data: {
                        status: "Deploying..."
                    }
                });
                return;
            }else{
                datapoint.Status = "Active";
                DataPoint.save1(datapoint);
                res.status(200).send({
                    code: 1,
                    msg: "Success",
                    data: {
                        status: "Running...",
                        link: datapoint.DeployedLink,
                    }
                })
                return;
            }    
        }else{
            res.status(200).send({
                code: 1,
                msg: "Success",
                data: {
                    status: "Deploying..."
                }
            });
            return;
        }
    }else{
        for(i = 0 ; i < status.length ; i ++){
            if(status[i].state == "Terminated"){
                datapoint.Status = "Inactive";
                DataPoint.save1(datapoint);
                res.status(200).send({
                    code: 1,
                    msg: "Success",
                    data: {
                        status: "Terminated",
                    }
                })
                return;
            }
        }
        res.status(200).send({
            code: 1,
            msg: "Success",
            data: {
                status: "Deploying..."
            }
        })
        return;
    }
}

const getDataPointStatus1 = async (req, res) => {
    const {CGNameBE, CGNameFE} = req.body;
    let datapoint = await DataPoint.findOne({FeCiName: CGNameFE});
    let resJson2 = await fetch(`https://${datapoint.DeployedLink}`);
    if(resJson2.status == 200){
        let azureRef = resJson2.headers.get("x-azure-ref")
        if(azureRef == null || azureRef == undefined){
            res.status(200).send({
                code: 1,
                msg: "Success",
                data: {
                    status: "Deploying..."
                }
            });
            return;
        }else{
            res.status(200).send({
                code: 1,
                msg: "Success",
                data: {
                    status: "Running..."
                }
            })
        }
    }else{
        res.status(200).send({
            code: 1,
            msg: "Success",
            data: {
                status: "Deploying..."
            }
        })
    }
}

const getListByRG = async (req, res) => {
    const {RGName} = req.body;
    let resJson;
    try{
        resJson = await listByRG(RGName);
    }catch(err){
        console.log(err);
        res.status(200).send({
            code: 0,
            msg: "Failed, resource group name incorrect",
        })
        return;
    }
    res.status(200).send({
        code: 1, 
        msg: "Success",
        data: resJson
    })
}

const updateDataPoint = async (req, res) => {
    logger.info("Update DataPoint");
    const {engineUser} = req;
    const dp = req.body;
    const savedDP = await DataPoint.save1(dp);
    await DataPointLog.createLog({
        UserId: engineUser._id,
        DataPointId: savedDP._id,
        Activity: "Datapoint Updated",
        Content: "Success",
    })
    res.status(200).send({
        code: 1,
        msg: "Update DataPoint Success",
        data: {
            "DataPoint": savedDP
        }
    })
}

const updateDataPointStatus = async (req, res) => {
    logger.info("Activate/Deactivate Datapoint");
    const { engineUser } = req;
    // if(engineUser.role == "User"){
    //     res.status(200).send({
    //         code: 0,
    //         msg: "Failed, permission denied",
    //     })
    //     return;
    // }
    if(engineUser.status == "Inactive"){
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied."
        })
        return;
    }

    const { Id, Status } = req.body;
    let datapoints = await DataPoint.find({_id: ObjectId(Id)});
    if(datapoints.length == 0){
        res.status(200).send({
            code: 0,
            msg: "Failed, Datapoint not found",
        })
        return;
    }

    datapoints = datapoints[0]
    
    if(engineUser.role == "User" && engineUser._id.toString() != datapoints.CreatedBy.toString()){
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied.\n You can update only your datapoints.",
        })
        return;
    }
    const creds = await msRestNodeAuth.loginWithServicePrincipalSecret(DEFAULT_AZURE_CLIENTID, DEFAULT_AZURE_SECRET, DEFAULT_AZURE_DOMAIN);
    const context = new ci.ContainerInstanceManagementClientContext(creds, DEFAULT_AZURE_SUBSCRIPTIONID);
    const containersGroup = new ci.ContainerGroups(context);
    const rg = "RnD-rg";

    try{
        if(Status == "Active"){
            if(datapoints.BeCiName && datapoints.BeCiName != ""){
                await containersGroup.beginStart(rg, datapoints.BeCiName);
            }
            if(datapoints.FeCiName && datapoints.FeCiName != ""){
                await containersGroup.beginStart(rg, datapoints.FeCiName);            
            }    
        }else if(Status == "Inactive"){
            if(datapoints.BeCiName && datapoints.BeCiName != ""){
                await containersGroup.stop(rg, datapoints.BeCiName);
            }
            if(datapoints.FeCiName && datapoints.FeCiName != ""){
                await containersGroup.stop(rg, datapoints.FeCiName);            
            }    
        }    
    }catch(err){
        console.log(err);
        res.status(200).send({
            code: 0,
            msg: "Sorry, can't determine long running operation polling strategy. \n Please try again later..."
        })
    }

    let dp = { _id: ObjectId(Id) }
    let sts = "Activating";
    if(Status == "Active") {
        sts = "Activating";
    }else{
        sts = "Deactivating";
    }
    let data = { Status: sts } // Active, Inactive
    await DataPoint.updateDPData(dp, data);
    await Log.createLog({
        UserId: engineUser._id,
        Activity: `Datapoint status updated to ${Status}`,
        Content: "Success",
    })
    await DataPointLog.createLog({
        UserId: engineUser._id,
        DataPointId: ObjectId(Id),
        Activity: `Datapoint Status Updated to ${Status}`,
        Content: "Success",
    })
    res.status(200).send({
        code: 1,
        msg: "Success"
    })
}

const getAllDataPoint = async (req, res) => {
    console.log("DataPoint List");

    let result = await DataPoint.find({});
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: {
            list: result
        }
    })
}

const getDataPointOfOrganization = async(req, res) => {
    console.log("DataPoint List of Organization");

    const { OrganizationId } = req.body;
    //role check
    const {engineUser} = req;
    let pass = false;
    if(engineUser.role == "SuperAdmin"){
        pass = true;
    }else if(engineUser.role == "Admin" && engineUser.organizationId == OrganizationId ){
        pass = true;
    }else{
        pass = false;
    }
    if(!pass){
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied",
        });
        return;
    }
    const datapoints = await DataPoint.find({OrganizationId: ObjectId(OrganizationId)});
    let data = [];
    for(let i = 0 ; i < datapoints.length ; i ++){
        data.push({
            FDPName: datapoints[i].DataPointName,
            FDPType: datapoints[i].TypeOfDataPoint,
            Region: datapoints[i].Region,
            Status: datapoints[i].Status,
            CreatedOn: datapoints[i].createdAt
        })
    }
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: {
            list: data
        }
    })
}

const selectDataPoint = async (req, res) => {
    console.log("DataPoint List");
    const { Id } = req.body;
    // Check organization ???
    let result = await DataPoint.find({ _id: ObjectId(Id) });
    if(result.length == 0){
        res.status(200).send({
            code: 0,
            msg: "Datapoint not exist",
        })
    }else{
        res.status(200).send({
            code: 1,
            msg: "Success",
            data: result[0],
        })    
    }
}

const deleteDataPoint = async (req, res) => {
    logger.info("Delete DataPoint");
    const { engineUser } = req;
    // if(engineUser.role == "User"){
    //     res.status(200).send({
    //         code: 0,
    //         msg: "Failed, permission denied",
    //     })
    //     return;
    // }

    const { Id } = req.body;
    let datapoints = await DataPoint.find({_id: ObjectId(Id)});
    if(datapoints.length == 0){
        res.status(200).send({
            code: 0,
            msg: "Failed, Datapoint not found",
        })
        return;
    }

    datapoints = datapoints[0]
    if(engineUser.role == "User" && engineUser._id.toString() != datapoints.CreatedBy.toString()){
        res.status(200).send({
            code: 0,
            msg: "Failed, permission denied.\n You can delete only your datapoints.",
        })
        return;
    }
    const creds = await msRestNodeAuth.loginWithServicePrincipalSecret(DEFAULT_AZURE_CLIENTID, DEFAULT_AZURE_SECRET, DEFAULT_AZURE_DOMAIN);
    const context = new ci.ContainerInstanceManagementClientContext(creds, DEFAULT_AZURE_SUBSCRIPTIONID);
    const containersGroup = new ci.ContainerGroups(context);
    const rg = "RnD-rg";

    try{
        if(datapoints.BeCiName && datapoints.BeCiName != ""){
            await containersGroup.beginDeleteMethod(rg, datapoints.BeCiName);
        }
        if(datapoints.FeCiName && datapoints.FeCiName != ""){
            await containersGroup.beginDeleteMethod(rg, datapoints.FeCiName);            
        }    
    }catch(err){
        console.log(err);
        res.status(200).send({
            code: 0,
            msg: "Sorry, can't determine long running operation polling strategy. \n Please try again later..."
        })
        return;
    }
    await DataPoint.deleteDP( ObjectId(Id) );
    await Log.createLog({
        UserId: engineUser._id,
        Activity: "Datapoint Removed",
        Content: "Success",
    })
    res.status(200).send({
        code: 1,
        msg: "Delete DataPoint Success",
    })
}

const getRecentActivities = async (req, res) => {
    const { Id, PageNo, PageSize } = req.body;
    let params = { skip: (PageNo-1)*PageSize, limit: PageSize };
    let total = await DataPointLog.find({DataPointId: ObjectId(Id)});
    let result = await DataPointLog.list({DataPointId: ObjectId(Id)}, params);
    let data = []
    for(let i = 0 ; i < result.length ; i ++){
        let tmpdata = {};
        let user = await User.find({_id: result[i].UserId});
        if(user.length > 0){
            tmpdata.Username = user[0].firstname + " " + user[0].lastname;
        }else{
            tmpdata.Username = "Deleted user";
        }
        tmpdata.Activity = result[i].Activity;
        tmpdata.Content = result[i].Content;
        tmpdata.createdAt = result[i].createdAt;
        data.push(tmpdata);
    }
    
    res.status(200).send({
        code: 1,
        msg: "Success",
        data: {
            list: data,
            totalRowCount: total.length
        }
    })
}

module.exports = {
    createDataPoint,
    updateDataPoint,
    updateDataPointStatus,
    getAllDataPoint,
    selectDataPoint, 
    deleteDataPoint,
    getDataPointOfOrganization,
    getRecentActivities,
    getDataPointStatus,
    getListByRG,
}
