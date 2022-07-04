import "dotenv/config"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan"
import "hardhat-deploy"
import "hardhat-gas-reporter"
import "solidity-coverage"

const RINKEBY_RPC_URL: string =
    process.env.RINKEBY_RPC_URL! || "https://eth-rinkeby"
const PRIVATE_KEY: string = process.env.PRIVATE_KEY! || "0xkey"
const ETHERSCAN_API_KEY: string = process.env.ETHERSCAN_API_KEY! || "key"
const COIN_MKT_CAP_KEY: string = process.env.COIN_MKT_CAP_KEY! || "key"

export default {
    defaultNetwork: "hardhat",
    networks: {
        rinkeby: {
            // rpc url
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 4,
            blockConfirmations: 6,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        // coinMarketCap: COIN_MKT_CAP_KEY,
        token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
}
