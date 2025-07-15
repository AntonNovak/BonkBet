import { PublicKey } from '@solana/web3.js'
import { FAKE_TOKEN_MINT, GambaPlatformContext, GambaUi, PoolToken, TokenValue, useCurrentToken, useTokenBalance, useTokenMeta } from 'gamba-react-ui-v2'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Dropdown } from '../components/Dropdown'
import { Modal } from '../components/Modal'
import { POOLS } from '../constants'
import { useUserStore } from '../hooks/useUserStore'

const StyledToken = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  img {
    height: 20px;
  }
`

const StyledTokenImage = styled.img`
  height: 20px;
  aspect-ratio: 1/1;
  border-radius: 50%;
`

const StyledTokenButton = styled.button`
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 5px;
  color: white;
  &:hover {
    background: #ffffff11;
  }
`

const TokenSelectButton = styled(GambaUi.Button)`
  display: flex;
  align-items: center;
  gap: 10px;
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
`

function TokenImage({ mint, ...props }: {mint: PublicKey}) {
  const meta = useTokenMeta(mint)
  return (
    <StyledTokenImage src={meta.image} {...props} />
  )
}

function TokenSelectItem({ mint }: {mint: PublicKey}) {
  const balance = useTokenBalance(mint)
  return (
    <>
      <TokenImage mint={mint} />
      <TokenValue mint={mint} amount={balance.balance} />
    </>
  )
}

export default function TokenSelect() {
  const [visible, setVisible] = React.useState(false)
  const [warning, setWarning] = React.useState(false)
  const context = React.useContext(GambaPlatformContext)
  const selectedToken = useCurrentToken()
  const userStore = useUserStore()
  const balance = useTokenBalance()

  useEffect(() => {
    if (userStore.lastSelectedPool) {
      context.setPool(new PublicKey(userStore.lastSelectedPool.token), userStore.lastSelectedPool.authority ? new PublicKey(userStore.lastSelectedPool.authority) : undefined)
    }
  }, [])

  const selectPool = (pool: PoolToken) => {
    setVisible(false)
    if (
      import.meta.env.VITE_REAL_PLAYS_DISABLED &&
      !pool.token.equals(FAKE_TOKEN_MINT)
    ) {
      setWarning(true)
      return
    }
    context.setPool(pool.token, pool.authority)
    userStore.set({
      lastSelectedPool: {
        token: pool.token.toString(),
        authority: pool.authority?.toString(),
      },
    })
  }

  const click = () => {
    setVisible(!visible)
  }

  return (
    <>
      {warning && (
        <Modal>
          <h1>Real plays disabled</h1>
          <p>
            This platform only allows you to play with fake tokens.
          </p>
          <GambaUi.Button
            main
            onClick={() => setWarning(false)}
          >
            Okay
          </GambaUi.Button>
        </Modal>
      )}
      <div style={{ position: 'relative' }}>
        <TokenSelectButton onClick={click}>
          {selectedToken && (
            <StyledToken>
              <TokenImage mint={selectedToken.mint} />
              <TokenValue amount={balance.balance} />
            </StyledToken>
          )}
        </TokenSelectButton>
        <Dropdown visible={visible}>
          {POOLS.map((pool, i) => (
            <StyledTokenButton onClick={() => selectPool(pool)} key={i}>
              <TokenSelectItem mint={pool.token} />
            </StyledTokenButton>
          ))}
        </Dropdown>
      </div>
    </>
  )
}
