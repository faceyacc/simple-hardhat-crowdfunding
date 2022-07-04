import { ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { assert } from "chai"
import { BigNumber, Contract } from "ethers"
import { Address } from "hardhat-deploy/dist/types"

// Only runs if you are not on a development chain. It only runs on testnets
developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", async () => {
          let fundMe: Contract
          let deployer: Address
          const sendValue: BigNumber = ethers.utils.parseEther("0.1")
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to fund and withdraw", async () => {
              const fund = await fundMe.fund({ value: sendValue })
              await fund.wait(1)

              const withdraw = await fundMe.withdraw()
              await withdraw.wait(1)

              const endingFundMeBlanace = await fundMe.provider.getBalance(
                  fundMe.address
              )

              console.log(
                  `${endingFundMeBlanace.toString()}, should equal 0, running assert equal..........`
              )
              assert.equal(endingFundMeBlanace.toString(), "0")
          })
      })
