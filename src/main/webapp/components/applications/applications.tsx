/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import * as React from 'react'
import { CircularProgress } from '@connexta/atlas/atoms/progress'
import { Paper } from '@connexta/atlas/atoms/paper'
import { Grid } from '@connexta/atlas/atoms/grid'
import { Button } from '@connexta/atlas/atoms/button'
import { hot } from 'react-hot-loader'
import { getDisplayName } from '../../types/App'
import Application from '../application/application'
import { useAppRootContext } from '../app-root/app-root.pure'

import { Route, Link, Switch, RouteComponentProps } from 'react-router-dom'
import { Typography } from '@connexta/atlas/atoms/typography'
import { InstanceRouteContextProvider } from '../app-root/route'

const TopLevel = () => {
  const { applications } = useAppRootContext()

  if (applications.length === 0) {
    return (
      <Paper style={{ padding: '20px' }}>
        <CircularProgress />
      </Paper>
    )
  }
  return (
    <Paper style={{ padding: '20px' }}>
      <Grid container alignItems="center" spacing={3}>
        {applications.map(app => {
          return (
            <Grid item key={app.name} xs={4} md={3}>
              <Link to={`/admin/applications/${app.name}`}>
                <Button
                  fullWidth
                  variant="outlined"
                  style={{ padding: '10px' }}
                  onClick={() => {}}
                >
                  {getDisplayName(app)}
                </Button>
              </Link>
            </Grid>
          )
        })}
      </Grid>
    </Paper>
  )
}

const NoMatch = ({ match, location }: RouteComponentProps) => {
  if (match.url.indexOf('applications') !== -1) {
    const notFoundApplication = location.pathname.split('applications/')[1]
    return (
      <>
        <Typography variant="h4" style={{ marginBottom: '10px' }}>
          Could not find the application: {notFoundApplication}
        </Typography>
        <TopLevel />
      </>
    )
  }
  return (
    <>
      <TopLevel />
    </>
  )
}

const Applications = () => {
  const { applications } = useAppRootContext()
  return (
    <Switch>
      <Route
        path="/admin/applications/:applicationId"
        render={routeComponentProps => {
          const app = applications.find(
            app => app.name === routeComponentProps.match.params.applicationId
          )
          if (app === undefined) {
            return <NoMatch {...routeComponentProps} />
          }
          return (
            <InstanceRouteContextProvider>
              <Application app={app} />
            </InstanceRouteContextProvider>
          )
        }}
      />
      <Route component={TopLevel} />
    </Switch>
  )
}

export default hot(module)(Applications)
