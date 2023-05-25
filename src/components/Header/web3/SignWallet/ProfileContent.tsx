import { Trans, t } from '@lingui/macro'
import { rgba } from 'polished'
import { LogOut, Plus } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import Avatar from 'components/Avatar'
import Column from 'components/Column'
import TransactionSettingsIcon from 'components/Icons/TransactionSettingsIcon'
import Row, { RowBetween } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import { APP_PATHS } from 'constants/index'
import useLogin from 'hooks/useLogin'
import useTheme from 'hooks/useTheme'
import { NOTIFICATION_ROUTES } from 'pages/NotificationCenter/const'
import { ApplicationModal } from 'state/application/actions'
import { useToggleModal } from 'state/application/hooks'
import { ConnectedProfile, useAllProfileInfo } from 'state/authen/hooks'
import getShortenAddress from 'utils/getShortenAddress'

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 320px;
`

const ActionWrapper = styled.div`
  display: flex;
  gap: 20px;
  padding: 12px 20px;
  justify-content: space-between;
`

const ProfileItemWrapper = styled(RowBetween)<{ active: boolean }>`
  padding: 10px 20px;
  color: ${({ theme, active }) => (active ? theme.primary : theme.subText)};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  :hover {
    background-color: ${({ theme }) => rgba(theme.buttonBlack, 0.5)};
  }
`

const ProfileItem = ({
  data: { active, guest, address: account, profile },
  refreshProfile,
}: {
  data: ConnectedProfile
  refreshProfile: () => void
}) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const toggleModal = useToggleModal(ApplicationModal.SWITCH_PROFILE_POPUP)
  const { signInEth, signInAnonymous, signOut } = useLogin()

  const onClick = () => {
    if (guest) signInAnonymous()
    else signInEth(account)
    toggleModal()
  }

  return (
    <ProfileItemWrapper active={active} onClick={onClick}>
      <Row gap="8px" align="center">
        <Avatar url={profile?.avatarUrl} size={26} color={active ? theme.primary : theme.subText} />
        <Column gap="4px">
          <Text fontWeight={'500'} fontSize={'14px'}>
            {profile?.nickname}
          </Text>
          <Text fontWeight={'500'} fontSize={'14px'}>
            {guest ? account : getShortenAddress(account)}
          </Text>
        </Column>
      </Row>
      <Row justify="flex-end" gap="18px" align="center">
        {!guest && (
          <LogOut
            size={20}
            onClick={e => {
              e?.stopPropagation()
              signOut(account)
              refreshProfile()
            }}
          />
        )}
        <MouseoverTooltip text={t`Edit Profile Details`} width="fit-content" placement="top">
          <TransactionSettingsIcon
            size={20}
            fill={theme.subText}
            onClick={e => {
              e?.stopPropagation()
              navigate(
                `${APP_PATHS.NOTIFICATION_CENTER}${
                  guest ? NOTIFICATION_ROUTES.GUEST_PROFILE : `${NOTIFICATION_ROUTES.PROFILE}/${account}`
                }`,
              )
              toggleModal()
            }}
          />
        </MouseoverTooltip>
      </Row>
    </ProfileItemWrapper>
  )
}
const ProfileContent = () => {
  const theme = useTheme()
  const { signInEth } = useLogin()

  const { profiles, refresh } = useAllProfileInfo()

  return (
    <ContentWrapper>
      <Column>
        {profiles.map(data => (
          <ProfileItem key={data.address} data={data} refreshProfile={refresh} />
        ))}
      </Column>
      <ActionWrapper>
        <Flex
          color={theme.subText}
          alignItems={'center'}
          style={{ gap: '6px' }}
          onClick={() => signInEth()}
          fontWeight={'400'}
          fontSize={'14px'}
        >
          <Plus size={20} /> <Trans>Add Account</Trans>
        </Flex>
      </ActionWrapper>
    </ContentWrapper>
  )
}
export default ProfileContent
