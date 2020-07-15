/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import React, { useContext, useState, useEffect } from 'react'
import { Box, Button, Heading, SpaceVertical } from '@looker/components'
import {
  ExtensionContext,
  ExtensionContextData,
} from '@looker/extension-sdk-react'
import {
  ExtensionSDK,
  FetchProxy,
  FetchCustomParameters,
} from '@looker/extension-sdk'
import { ROUTES, DATA_SERVER_URL } from '../../App'
import { HomeSceneProps } from '.'
import { useHistory, useLocation } from 'react-router-dom'

/**
 * Default scene for the APIKEY demo.
 *
 * Verifies that a valid license has been defined to user attributes in the Looker server.
 * If the license is not valid the user can add the user attribute using the core SDK.
 */

/**
 * JWT state is stored in push state
 */
interface LocationState {
  jwt_token?: string
}

export const HomeScene: React.FC<HomeSceneProps> = ({
  updateCriticalMessage,
  updatePositiveMessage,
  clearMessage,
}) => {
  const history = useHistory()
  const location = useLocation()
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const { extensionSDK, core40SDK } = extensionContext
  // Disable add/update license button until license check complete
  const [licenseCheckComplete, setLicenseCheckComplete] = useState<boolean>(
    false
  )

  /**
   * Creates a fetch proxy with a bearer token. Centralizes the setup
   * of the fetch call. Note cookies could be used but with the advent
   * of SameSite: none, third party cookies no longer work with servers
   * that do not use SSL.
   */
  const createDataServerFetchProxy = (
    extensionSDK: ExtensionSDK,
    locationState?: any
  ): FetchProxy => {
    const init: FetchCustomParameters = {}
    if (locationState && locationState.jwt_token) {
      init.headers = {
        Authorization: `Bearer ${locationState.jwt_token}`,
      }
    }
    return extensionSDK.createFetchProxy(undefined, init)
  }

  useEffect(() => {
    // Initialize the scene
    const initialize = async () => {
      try {
        // Get information about the current user.
        const value = await core40SDK.ok(core40SDK.me())
        const name = value.display_name || 'Unknown'
        const email = value.email || 'Unknown'

        // Prepare to validate the license key. Create secret key tag
        // creates a specially formatted string that the Looker server
        // looks for and replaces with secret keys stored in the Looker
        // server.
        const license_key = extensionSDK.createSecretKeyTag('license_key')
        // Call the data server license check to validate the license.
        // Note the license remains in the Looker server.
        const response = await extensionSDK.serverProxy(
          `${DATA_SERVER_URL}/license_check`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ license_key, name, email }),
          }
        )
        if (response.ok) {
          if (response.body) {
            const { jwt_token } = response.body
            if (jwt_token) {
              // Got a jwt token in the response so the license check was good.
              // Store the jwt token in push state. This allows the jwt token
              // to be preserved on a page reload. Not needed for this demo
              // however the token does need to be stored somewhere.
              history.replace(location.pathname, { jwt_token })
              updatePositiveMessage('License is valid')
            } else {
              // No jwt token so not valid
              updateCriticalMessage('License is NOT valid')
            }
          }
        } else {
          // Invalid response so not valid
          updateCriticalMessage('License is NOT valid')
        }
      } catch (error) {
        updateCriticalMessage('Unexpected error occured')
        console.error(error)
      }
      // License check is now complete so unprotect the add/update license button
      setLicenseCheckComplete(true)
    }
    initialize()
  }, [])

  /**
   * On add/update licence button navigate click navigate to license scene
   */
  const onAddUpdateLicenseClick = () => {
    clearMessage()
    history.push(ROUTES.LICENSE_ROUTE, location.state)
  }

  /**
   * Verify the jwt token
   */
  const onVerifyTokenClick = async () => {
    try {
      clearMessage()
      const fetchProxy = createDataServerFetchProxy(
        extensionSDK,
        location.state
      )
      // Call the data server ping endpoint to validate the token
      let response = await fetchProxy.fetchProxy(`${DATA_SERVER_URL}/ping`)
      if (response.ok) {
        updatePositiveMessage('JWT Token is valid')
      } else {
        updateCriticalMessage('JWT Token is NOT valid')
      }
    } catch (error) {
      updateCriticalMessage('Unexpected error occured')
    }
  }

  const { state } = location
  const { jwt_token } = (state || {}) as LocationState

  return (
    <Box m="large">
      <SpaceVertical>
        <Heading>Home</Heading>
        <Button onClick={onVerifyTokenClick} disabled={!jwt_token}>
          Verify JWT token
        </Button>
        <Button
          onClick={onAddUpdateLicenseClick}
          disabled={!licenseCheckComplete}
        >
          Add/Update license
        </Button>
      </SpaceVertical>
    </Box>
  )
}
