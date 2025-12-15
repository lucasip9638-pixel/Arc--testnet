"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StakingProps {
  account: string | null
}

export function Staking({ account }: StakingProps) {
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [stakedBalance, setStakedBalance] = useState(0)
  const [pendingRewards, setPendingRewards] = useState(0)
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  const apy = 10 // 10% APY
  const availableBalance = 1000 // Mock balance

  // Simulate rewards accumulation
  useEffect(() => {
    if (!account || stakedBalance === 0) return

    const interval = setInterval(() => {
      // Calculate rewards per second: (staked * APY) / (365 * 24 * 60 * 60)
      const rewardsPerSecond = (stakedBalance * (apy / 100)) / (365 * 24 * 60 * 60)
      setPendingRewards((prev) => prev + rewardsPerSecond)
    }, 1000)

    return () => clearInterval(interval)
  }, [account, stakedBalance, apy])

  const handleStake = async () => {
    if (!account || !stakeAmount || Number.parseFloat(stakeAmount) <= 0) return

    setIsStaking(true)

    try {
      // Simulate staking transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setStakedBalance((prev) => prev + Number.parseFloat(stakeAmount))
      setStakeAmount("")
    } catch (error) {
      console.error("Staking failed:", error)
    } finally {
      setIsStaking(false)
    }
  }

  const handleUnstake = async () => {
    if (!account || !unstakeAmount || Number.parseFloat(unstakeAmount) <= 0) return
    if (Number.parseFloat(unstakeAmount) > stakedBalance) return

    setIsUnstaking(true)

    try {
      // Simulate unstaking transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setStakedBalance((prev) => prev - Number.parseFloat(unstakeAmount))
      setUnstakeAmount("")
    } catch (error) {
      console.error("Unstaking failed:", error)
    } finally {
      setIsUnstaking(false)
    }
  }

  const handleClaimRewards = async () => {
    if (!account || pendingRewards <= 0) return

    setIsClaiming(true)

    try {
      // Simulate claim transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setPendingRewards(0)
    } catch (error) {
      console.error("Claim failed:", error)
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <h2 className="text-2xl font-bold text-foreground mb-6">Staking</h2>

      {/* Staking Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-background/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Staked</p>
          <p className="text-2xl font-bold text-foreground">{stakedBalance.toFixed(2)} USDC</p>
        </div>
        <div className="bg-background/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">APY</p>
          <p className="text-2xl font-bold text-accent">{apy}%</p>
        </div>
      </div>

      {/* Pending Rewards */}
      <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg p-4 mb-6 border border-accent/20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pending Rewards</p>
            <p className="text-3xl font-bold text-foreground">{pendingRewards.toFixed(6)} USDC</p>
          </div>
        </div>
        <Button
          onClick={handleClaimRewards}
          disabled={!account || pendingRewards <= 0 || isClaiming}
          className="w-full"
          variant="secondary"
        >
          {isClaiming ? "Claiming..." : "Claim Rewards"}
        </Button>
      </div>

      {/* Stake/Unstake Tabs */}
      <Tabs defaultValue="stake" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="stake">Stake</TabsTrigger>
          <TabsTrigger value="unstake">Unstake</TabsTrigger>
        </TabsList>

        <TabsContent value="stake" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Amount to Stake</label>
              <span className="text-xs text-muted-foreground">Available: {availableBalance.toFixed(2)} USDC</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="flex-1 bg-background/50 border-border/50"
                disabled={!account}
              />
              <Button
                variant="ghost"
                onClick={() => setStakeAmount(availableBalance.toString())}
                disabled={!account}
                className="text-accent hover:text-accent/80"
              >
                MAX
              </Button>
            </div>
          </div>

          <Button
            onClick={handleStake}
            disabled={!account || !stakeAmount || Number.parseFloat(stakeAmount) <= 0 || isStaking}
            className="w-full h-12"
          >
            {!account ? "Connect Wallet" : isStaking ? "Staking..." : "Stake"}
          </Button>
        </TabsContent>

        <TabsContent value="unstake" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Amount to Unstake</label>
              <span className="text-xs text-muted-foreground">Staked: {stakedBalance.toFixed(2)} USDC</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="flex-1 bg-background/50 border-border/50"
                disabled={!account}
              />
              <Button
                variant="ghost"
                onClick={() => setUnstakeAmount(stakedBalance.toString())}
                disabled={!account || stakedBalance === 0}
                className="text-accent hover:text-accent/80"
              >
                MAX
              </Button>
            </div>
          </div>

          <Button
            onClick={handleUnstake}
            disabled={
              !account ||
              !unstakeAmount ||
              Number.parseFloat(unstakeAmount) <= 0 ||
              Number.parseFloat(unstakeAmount) > stakedBalance ||
              isUnstaking
            }
            className="w-full h-12"
          >
            {!account ? "Connect Wallet" : isUnstaking ? "Unstaking..." : "Unstake"}
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
