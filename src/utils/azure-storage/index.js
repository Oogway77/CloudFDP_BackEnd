const { ShareServiceClient, StorageSharedKeyCredential } = require("@azure/storage-file-share");

const {
    STORAGE_ACCOUNT_KEY,
    STORAGE_ACCOUNT_NAME    
} = require('../../config/config');

const account = STORAGE_ACCOUNT_NAME;
const accountKey = STORAGE_ACCOUNT_KEY;

const credential = new StorageSharedKeyCredential(account, accountKey);
const serviceClient = new ShareServiceClient(
  `https://${account}.file.core.windows.net`,
  credential
);

const createShare = async (shareName) => {
    // const shareName = `newshare${new Date().getTime()}`;
    const shareClient = serviceClient.getShareClient(shareName);
    await shareClient.create();
    console.log(`Create share ${shareName} successfully`);  
}

const createDirectory = async (shareName, directoryName) => {
    // const directoryName = `newdirectory${new Date().getTime()}`;
    const shareClient = serviceClient.getShareClient(shareName);
    const directoryClient = shareClient.getDirectoryClient(directoryName);
    await directoryClient.create();
    console.log(`Create directory ${directoryName} successfully`);
}

const createShareAndDir = async (shareName, directoryName) => {
    console.log(shareName, directoryName);
    const shareClient = serviceClient.getShareClient(shareName);
    await shareClient.create();
    // console.log(`Create share ${shareName} successfully`);
    const directoryClient = shareClient.getDirectoryClient(directoryName);
    await directoryClient.create();
    // console.log(`Create directory ${directoryName} successfully`);
  
}

const createFile = async (shareName, directoryName, fileName, fileContent) => {
    const directoryClient = serviceClient.getShareClient(shareName).getDirectoryClient(directoryName);

    const content = fileContent;
    // const fileName = "newfile" + new Date().getTime();
    const fileClient = directoryClient.getFileClient(fileName);
    await fileClient.create(content.length);
    console.log(`Create file ${fileName} successfully`);
  
    // Upload file range
    await fileClient.uploadRange(content, 0, content.length);
    // console.log(`Upload file range "${content}" to ${fileName} successfully`);
}

module.exports = {
    createShare: createShare,
    createDirectory: createDirectory,
    createFile: createFile,
    createShareAndDir: createShareAndDir,
}