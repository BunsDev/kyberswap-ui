import KyberOauth2 from '@kybernetwork/oauth2'
import { Trans } from '@lingui/macro'
import { rgba } from 'polished'
import { useState } from 'react'
import { Info, LogOut, Save } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components'

import { AddressInput } from 'components/AddressInputPanel'
import { ButtonOutlined, ButtonPrimary } from 'components/Button'
import Column from 'components/Column'
import CopyHelper from 'components/Copy'
import ProfileIcon from 'components/Icons/Profile'
import { Input } from 'components/Input'
import Row from 'components/Row'
import { useValidateEmail } from 'components/SubscribeButton/NotificationPreference'
import InputEmail from 'components/SubscribeButton/NotificationPreference/InputEmail'
import { useActiveWeb3React } from 'hooks'
import { useSignInETH } from 'hooks/useLogin'
import useTheme from 'hooks/useTheme'
import VerifyCodeModal from 'pages/Verify/VerifyCodeModal'
import { useSessionInfo } from 'state/authen/hooks'
import { ExternalLink } from 'theme'
import { shortenAddress } from 'utils'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px 24px;
  gap: 20px;
  max-width: 630px;
`

const Label = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.subText};
`

const AvatarWrapper = styled.div`
  border-radius: 100%;
  padding: 16px;
  background-color: ${({ theme }) => theme.buttonBlack};
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const LeftColum = styled(Column)`
  width: 420px;
  gap: 20px;
`

const StyledAddressInput = styled(AddressInput)`
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 20px;
  height: 42px;
`

const WarningWrapper = styled.div`
  border-radius: 24px;
  background-color: ${({ theme }) => rgba(theme.subText, 0.2)};
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 8px 14px;
`
const SignMessage = () => {
  const signIn = useSignInETH()
  const theme = useTheme()
  return (
    <WarningWrapper>
      <Row style={{ gap: '12px' }}>
        <Info color={theme.subText} size={40} />
        <Text fontSize={'12px'}>
          You are not signed in with this wallet address. Click Sign-In to link your wallet to a profile. This will
          allow us to offer you a better experience. Read more <ExternalLink href="#">here ↗</ExternalLink>
        </Text>
      </Row>
      <ButtonPrimary width={'130px'} height={'36px'} fontSize={'14px'} onClick={signIn}>
        Sign-in
      </ButtonPrimary>
    </WarningWrapper>
  )
}

// todo sign in anonymous lau qua ko call api dc
export default function Profile() {
  const theme = useTheme()

  const { chainId, account } = useActiveWeb3React()
  const { formatUserInfo, isLogin } = useSessionInfo()
  const { inputEmail, onChangeEmail, errorColor } = useValidateEmail(formatUserInfo?.email)
  const [nickName, setNickName] = useState(formatUserInfo?.nickname || account || '')

  const [isShowVerify, setIsShowVerify] = useState(false)
  const showVerifyModal = () => {
    setIsShowVerify(true)
  }
  const onDismissVerifyModal = () => {
    setIsShowVerify(false)
  }

  const saveProfile = () => {
    console.log(nickName, inputEmail)
  }
  const thisAccount = '0xF14DE383fE1f5ECA59dbC33A7d7aB527AD7c8c94'
  const isVerifiedEmail = formatUserInfo?.email && inputEmail === formatUserInfo?.email
  return (
    <Wrapper>
      <Text fontSize={'24px'} fontWeight={'500'}>
        <Trans>Profile Details</Trans>
      </Text>
      {(!isLogin || account?.toLowerCase() !== thisAccount?.toLowerCase()) && <SignMessage />}
      <Row gap="32px" align={'flex-start'} justify={'space-between'}>
        <LeftColum>
          <FormGroup>
            <Label>
              <Trans>User Name</Trans>
            </Label>
            <Input value={nickName} onChange={e => setNickName(e.target.value)} />
          </FormGroup>

          <FormGroup>
            <Label>
              <Trans>Email Address</Trans>
            </Label>
            <InputEmail
              showVerifyModal={showVerifyModal}
              errorColor={errorColor}
              onChange={onChangeEmail}
              value={inputEmail}
              isVerifiedEmail={!!isVerifiedEmail}
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Trans>Wallet Address</Trans>
            </Label>
            <StyledAddressInput
              style={{ color: theme.subText, cursor: 'pointer' }}
              disabled
              value={shortenAddress(chainId, account ?? '', 17, false)}
              icon={<CopyHelper toCopy={account ?? ''} style={{ color: theme.subText }} />}
            />
          </FormGroup>

          <Row gap="20px">
            <ButtonOutlined width={'120px'} height={'36px'} fontSize={'14px'}>
              <LogOut size={16} style={{ marginRight: '4px' }} />
              Log Out
            </ButtonOutlined>
            <ButtonPrimary width={'120px'} height={'36px'} fontSize={'14px'} onClick={saveProfile}>
              <Save size={16} style={{ marginRight: '4px' }} />
              Save
            </ButtonPrimary>
          </Row>
        </LeftColum>

        <FormGroup>
          <Label>
            <Trans>Profile Picture</Trans>
          </Label>
          <AvatarWrapper>
            <ProfileIcon size={82} color={theme.subText} />
          </AvatarWrapper>
        </FormGroup>
      </Row>
      <VerifyCodeModal
        isOpen={isShowVerify}
        onDismiss={onDismissVerifyModal}
        email={inputEmail}
        onVerifySuccess={onDismissVerifyModal}
      />
    </Wrapper>
  )
}
