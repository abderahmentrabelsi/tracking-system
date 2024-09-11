'use client'
import axios from 'axios'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import classnames from 'classnames'
import type { SystemMode } from '@core/types'
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

const TwoStepsIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 650,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const TwoStepsV2 = ({ mode }: { mode: SystemMode }) => {
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, '/images/pages/auth-mask-light.png', '/images/pages/auth-mask-dark.png')
  const characterIllustration = useImageVariant(
    mode,
    '/images/illustrations/auth/v2-two-steps-light.png',
    '/images/illustrations/auth/v2-two-steps-dark.png'
  )

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userId = searchParams.get('user_id')
      const identifier = searchParams.get('identifier')
      const password = searchParams.get('password')
      const redirectUri = searchParams.get('redirect_uri')
      const response = await axios.post(`${process.env.NEXT_PUBLIC_GO_APP_SERVER_URL}/login`, {
        Identifier: identifier,
        Password: password,
        Code: code,
        RedirectURI: redirectUri
      })
      const { access_token, userRole } = response.data.data

      document.cookie = `access_token=${access_token}; path=/`
      localStorage.setItem('userRole', userRole)
      router.push(redirectUri || '/home')
    } catch (error) {
      console.error('Failed to verify TOTP', error)
      setErrorMessage('Invalid TOTP code')
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <TwoStepsIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Two Step Verification 💬</Typography>
            <Typography>Enter the code from the mobile in the field below.</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleVerify} className='flex flex-col gap-6'>
            <div className='flex flex-col gap-2'>
              <Typography>Type your 6 digit security code</Typography>
              <div className='flex items-center justify-between gap-4'>
                <CustomTextField
                  size='medium'
                  autoFocus
                  className='[&_input]:text-center'
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>
            </div>
            <Button fullWidth variant='contained' type='submit'>
              Verify
            </Button>
            {errorMessage && <Alert severity='error'>{errorMessage}</Alert>}
          </form>
        </div>
      </div>
    </div>
  )
}

export default TwoStepsV2
