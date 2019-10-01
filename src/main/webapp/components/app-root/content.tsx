import * as React from 'react'
import Applications from '../applications/applications'
import { System } from '../system'
import { Installer } from '../installer/installer'
import { Typography } from '@connexta/atlas/atoms/typography'
import { useAppRootContext } from '../app-root/app-root.pure'
import { Route, Switch } from 'react-router-dom'
import { InstanceRouteContextProvider } from './route'
import { Iframe } from '../iframe/iframe'
import { ID_TO_NAME } from './links'

const Wizards = () => {
  const { modules } = useAppRootContext()
  const wizardsModule = modules.filter(module => module.id === 'setup')[0]
  if (wizardsModule === undefined) {
    return <div>Docs not yet available</div>
  }
  const srcUrl = wizardsModule.iframeLocation
  return <Iframe url={srcUrl} />
}

const Docs = () => {
  const { modules } = useAppRootContext()
  const docsModule = modules.filter(
    module => module.name === 'Documentation'
  )[0]
  if (docsModule === undefined) {
    return <div>Docs not yet available</div>
  }
  const srcUrl = docsModule.iframeLocation
  return <Iframe url={srcUrl} />
}

const HomeMatch = () => {
  const { modules } = useAppRootContext()
  const applicationsInstalled =
    modules.filter(module => module.name === 'Applications')[0] !== undefined
  const installerInstalled =
    modules.filter(module => module.name === 'Setup')[0] !== undefined
  if (applicationsInstalled) {
    return <Applications />
  } else if (installerInstalled) {
    return <Installer />
  }
  return <div>Please contact support.</div>
}

const NoMatch = () => {
  return (
    <>
      <Typography variant="h4">
        Could not find what you're looking for.
      </Typography>
      <Typography variant="h5">
        It's possible the url is wrong, or the place you're looking for
        currently isn't available on the system.
      </Typography>
    </>
  )
}

export const Content = () => {
  const { modules } = useAppRootContext()

  return (
    <Switch>
      <Route
        path="/admin/:moduleId"
        render={routeProps => {
          const currentModule = modules.filter(
            module =>
              ID_TO_NAME[module.id].toLowerCase() ===
              routeProps.match.params.moduleId
          )[0]
          if (currentModule !== undefined) {
            switch (ID_TO_NAME[currentModule.id]) {
              case 'System':
                return (
                  <InstanceRouteContextProvider>
                    <System />
                  </InstanceRouteContextProvider>
                )
              case 'Applications':
                return (
                  <InstanceRouteContextProvider>
                    <Applications />
                  </InstanceRouteContextProvider>
                )
              case 'Documentation':
                return <Docs />
              case 'Installer':
                return (
                  <InstanceRouteContextProvider>
                    <Installer />
                  </InstanceRouteContextProvider>
                )
              case 'Wizards':
                return <Wizards />
            }
          }
          return <NoMatch />
        }}
      />
      <Route component={HomeMatch} />
    </Switch>
  )
}
