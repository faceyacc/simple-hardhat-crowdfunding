import { assert, expect } from "chai"
import { BigNumber, Contract, Signer } from "ethers"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { Address } from "hardhat-deploy/dist/types"
import { developmentChains } from "../../helper-hardhat-config"

// only runs on developement chains
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe: Contract
          let deployer: Address
          let mockV3Aggregator: Contract
          let sendValue: BigNumber = ethers.utils.parseEther("1")
          beforeEach(async () => {
              // get account you want connected to contract
              deployer = (await getNamedAccounts()).deployer

              // Deploys all contracts from deploy folder
              await deployments.fixture(["all"])

              // Get FundMe contract and account an account (deployer)
              fundMe = await ethers.getContract("FundMe", deployer)

              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async () => {
              it("sets the aggregator address correctly", async () => {
                  const response = await fundMe.getPriceFeed()
                  assert(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "FundMe__NotEnoughETH"
                  )
              })

              it("Updated the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )

                  assert.equal(response.toString(), sendValue.toString())
              })

              it("Adds getFounder to array", async () => {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFounder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async () => {
              // add money into the contract before we test the withdraw function
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("Can withdraw ETH from a single founder", async () => {
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const txnResponse = await fundMe.withdraw()
                  const txnReceipt = await txnResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = txnReceipt

                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBlanace = (await fundMe.provider.getBalance(
                      fundMe.address
                  )) as unknown as number

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBlanace, 0)

                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance)
                          .toString,
                      endingDeployerBalance.add(gasCost).toString // adding gas to transaction
                  )
              })

              it("Allows to withdraw ETH with multiple getFounder", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (let account = 6; account < 6; account++) {
                      const fundMeConnectedContracts = fundMe.connect(
                          accounts[account]
                      )
                      await fundMeConnectedContracts.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Act
                  const txnResponse = await fundMe.withdraw()
                  const txnReceipt = await txnResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txnReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Assert
                  const endingFundMeBlanace = (await fundMe.provider.getBalance(
                      fundMe.address
                  )) as unknown as number

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBlanace, 0)

                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance)
                          .toString,
                      endingDeployerBalance.add(gasCost).toString // adding gas to transaction
                  )

                  // Make sure the getFounder are reset properly
                  await expect(fundMe.getFounder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allow owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = fundMe.connect(accounts[1])

                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
          })

          describe("cheaperWithdraw", async () => {
              // add money into the contract before we test the withdraw function
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("Can withdraw ETH from a single founder", async () => {
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const txnResponse = await fundMe.cheaperWithdraw()
                  const txnReceipt = await txnResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = txnReceipt

                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBlanace = (await fundMe.provider.getBalance(
                      fundMe.address
                  )) as unknown as number

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBlanace, 0)

                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance)
                          .toString,
                      endingDeployerBalance.add(gasCost).toString // adding gas to transaction
                  )
              })

              it("Allows to withdraw ETH with multiple getFounder", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (let account = 6; account < 6; account++) {
                      const fundMeConnectedContracts = fundMe.connect(
                          accounts[account]
                      )
                      await fundMeConnectedContracts.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Act
                  const txnResponse = await fundMe.cheaperWithdraw()
                  const txnReceipt = await txnResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txnReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  // Assert
                  const endingFundMeBlanace = (await fundMe.provider.getBalance(
                      fundMe.address
                  )) as unknown as number

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundMeBlanace, 0)

                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance)
                          .toString,
                      endingDeployerBalance.add(gasCost).toString // adding gas to transaction
                  )

                  // Make sure the getFounder are reset properly
                  await expect(fundMe.getFounder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allow owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = fundMe.connect(accounts[1])

                  await expect(
                      fundMeConnectedContract.cheaperWithdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })
          })
      })
