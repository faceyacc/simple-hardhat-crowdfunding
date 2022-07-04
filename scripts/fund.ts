import { ethers, getNamedAccounts } from "hardhat"

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding contract.......")

    const txnResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.1"),
    })

    await txnResponse.wait(1)
    console.log("Funded! ✨")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
