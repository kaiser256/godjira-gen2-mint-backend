require('dotenv').config();
const mongoose = require('mongoose')
const fs = require('fs');
const ethers = require('ethers')
var List = fs.readFileSync('privatelist.txt', 'utf8').split('\n');
const privatelistSchema = require('./privatelistSchema')


async function privatelistSigner() {
    const provider = new ethers.getDefaultProvider(
        "wss://mainnet.infura.io/ws/v3/fe8e5ac01a944ba2a9fd24160581045a"
    );
    

    privateKey = process.env.PRIVATE_KEY
    keysToSing = List

    const domain = {
        name: process.env.SIGNING_DOMAIN_NAME,
        version: process.env.SIGNING_DOMAIN_VERSION,
        chainId: Number(process.env.CHAIN_ID),
        verifyingContract: process.env.CONTRACT_ID
    };
    const types = {
        privatelisted: [
            { name: 'privateAddress', type: 'address' },
            { name: 'isPrivateListed', type: 'bool' },
        ],

    };

    const wallet = new ethers.Wallet(privateKey)
    console.log(wallet.address)


    for (i in keysToSing) {
        // wallet.signMessage(keysToSing[i]).then((signature) => {
        //     console.log(signature)
        // })

        try {
            var wallet_address = keysToSing[i].replace(/(\r\n|\n|\r)/gm, "")
            if (wallet_address.endsWith('.eth') || wallet_address.endsWith('.ETH')) {
                console.log("Resolving ENS"+wallet_address)
                wallet_address = await provider.resolveName(wallet_address);
            }
            else{
                wallet_address = ethers.utils.getAddress(wallet_address)
            }
            console.log(wallet_address)
            const value = {
                privateAddress: wallet_address,
                isPrivateListed: true
            };

            sign = await wallet._signTypedData(domain, types, value)
            console.log(sign)
            // let test = await ethers.utils.verifyTypedData(domain, types, value, sign)
            // console.log(test)
            let new_signature = new privatelistSchema({
                address: wallet_address,
                signature: sign
            },{upsert: true})
            await privatelistSchema.findOneAndUpdate(new_signature)
            console.log(i)
        }
        catch (e) {
            console.log(e)
        }
    }
}

mongoose.connect(process.env.DATABASE_URI)
    .then(()=>{
        console.log('Database Connected')
        privatelistSigner()
    })
    .catch(()=> console.log("Database Connected Failed"))