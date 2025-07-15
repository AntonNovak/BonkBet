import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi, useReferral } from 'gamba-react-ui-v2'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { PLATFORM_ALLOW_REFERRER_REMOVAL, PLATFORM_REFERRAL_FEE } from '../constants'
import { useToast } from '../hooks/useToast'
import { useUserStore } from '../hooks/useUserStore'
import { truncateString } from '../utils'

const BonkButton = styled(GambaUi.Button)`
  background: #1a1a1a;
  border: 2px solid #F97425;
  color: white;
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 10px #F9742544;

  &:hover {
    background: #F97425;
    color: white;
    box-shadow: 0 0 15px #F9742588;
  }

  &:disabled {
    background: #333;
    border-color: #555;
    color: #777;
    cursor: not-allowed;
    box-shadow: none;
  }
`

const ModalButton = styled(GambaUi.Button)`
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
`

function UserModal() {
  const user = useUserStore()
  const wallet = useWallet()
  const toast = useToast()
  const walletModal = useWalletModal()
  const referral = useReferral()
  const [removing, setRemoving] = useState(false)

  const copyInvite = () => {
    try {
      referral.copyLinkToClipboard()
      toast({
        title: '📋 Copied to clipboard',
        description: 'Your referral code has been copied!',
      })
    } catch {
      walletModal.setVisible(true)
    }
  }

  const removeInvite = async () => {
    try {
      setRemoving(true)
      await referral.removeInvite()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <Modal onClose={() => user.set({ userModal: false })}>
      <h1>
        {truncateString(wallet.publicKey?.toString() ?? '', 6, 3)}
      </h1>
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'column', width: '100%', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', width: '100%' }}>
          <ModalButton main onClick={copyInvite}>
            💸 Copy invite link
          </ModalButton>
          <div style={{ opacity: '.8', fontSize: '80%' }}>
            Share your link with new users to earn {(PLATFORM_REFERRAL_FEE * 100)}% every time they play on this platform.
          </div>
        </div>
        {PLATFORM_ALLOW_REFERRER_REMOVAL && referral.referrerAddress && (
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', width: '100%' }}>
            <ModalButton disabled={removing} onClick={removeInvite}>
              Remove invite
            </ModalButton>
            <div style={{ opacity: '.8', fontSize: '80%' }}>
              {!removing ? (
                <>
                  You were invited by <a target="_blank" href={`https://solscan.io/account/${referral.referrerAddress.toString()}`} rel="noreferrer" style={{ color: '#F97425' }}>
                    {truncateString(referral.referrerAddress.toString(), 6, 6)}
                  </a>.
                </>
              ) : (
                <>Removing invite...</>
              )}
            </div>
          </div>
        )}
        <ModalButton onClick={() => wallet.disconnect()}>
          Disconnect
        </ModalButton>
      </div>
    </Modal>
  )
}

export function UserButton() {
  const walletModal = useWalletModal()
  const wallet = useWallet()
  const user = useUserStore()

  const connect = () => {
    if (wallet.wallet) {
      wallet.connect()
    } else {
      walletModal.setVisible(true)
    }
  }

  return (
    <>
      {wallet.connected && user.userModal && (
        <UserModal />
      )}
      {wallet.connected ? (
        <div style={{ position: 'relative' }}>
          <BonkButton
            onClick={() => user.set({ userModal: true })}
          >
            <div style={{ display: 'flex', gap: '.5em', alignItems: 'center' }}>
              <img alt="Wallet" src={wallet.wallet?.adapter.icon} height="20px" />
              {truncateString(wallet.publicKey?.toBase58(), 3)}
            </div>
          </BonkButton>
        </div>
      ) : (
        <BonkButton onClick={connect}>
          {wallet.connecting ? 'Connecting' : 'Connect'}
        </BonkButton>
      )}
    </>
  )
}
