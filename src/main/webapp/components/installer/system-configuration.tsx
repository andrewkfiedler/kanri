import * as React from 'react'
import { InstallerContext } from './installer.pure'
import { Grid } from '@connexta/atlas/atoms/grid'
import { Button } from '@connexta/atlas/atoms/button'
import { Step } from './step'
import { CircularProgress } from '@connexta/atlas/atoms/progress'
import fetch from '@connexta/atlas/functions/fetch'
import { InfoIcon } from '@connexta/atlas/atoms/icons'
import { TextField } from '@connexta/atlas/atoms/input'
import { Tooltip } from '@connexta/atlas/atoms/tooltip'
import { Typography } from '@connexta/atlas/atoms/typography'

const SYSTEM_PROPERTIES_READ_URL =
  '/admin/jolokia/exec/org.codice.ddf.ui.admin.api:type=SystemPropertiesAdminMBean/readSystemProperties'
const SYSTEM_PROPERTIES_WRITE_URL =
  '/admin/jolokia/exec/org.codice.ddf.ui.admin.api:type=SystemPropertiesAdminMBean/writeSystemProperties'

const createPayload = (attributes: AttributeType[]) => {
  return {
    type: 'EXEC',
    mbean: 'org.codice.ddf.ui.admin.api:type=SystemPropertiesAdminMBean',
    operation: 'writeSystemProperties',
    arguments: [
      attributes.reduce(
        (blob, attr) => {
          blob[attr.key] = attr.value
          return blob
        },
        {} as { [key: string]: string }
      ),
    ],
  }
}

type ModeType = 'loading' | 'normal' | 'submitting'

type AttributeType = {
  defaultValue: string
  description: string
  /**
   * ID for attr on backend
   */
  key: string
  options: null
  /**
   * Human Readable Name
   */
  title: string
  value: string
}

export const SystemConfiguration = () => {
  const [mode, setMode] = React.useState('loading' as ModeType)
  const [attributes, setAttributes] = React.useState([] as AttributeType[])
  const { nextStep, previousStep } = React.useContext(InstallerContext)

  React.useEffect(
    () => {
      if (mode === 'loading') {
        fetch(SYSTEM_PROPERTIES_READ_URL)
          .then(response => response.json())
          .then(data => {
            setAttributes(data.value)
            setMode('normal')
          })
      }
    },
    [mode]
  )
  React.useEffect(() => {
    if (mode === 'submitting') {
      fetch(SYSTEM_PROPERTIES_WRITE_URL, {
        method: 'POST',
        body: JSON.stringify(createPayload(attributes)),
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 200) {
            nextStep()
          } else {
            //warn?
          }
        })
    }
  })

  switch (mode) {
    case 'submitting':
      return (
        <Step
          content={
            <>
              Setting system properties
              <CircularProgress />
            </>
          }
        />
      )
    case 'normal':
      return (
        <Step
          content={
            <>
              <Typography variant="h4" style={{ marginBottom: '10px' }}>
                System Configuration Settings
              </Typography>
              <Grid container wrap="wrap" spacing={3}>
                {attributes.map((attr, index) => {
                  return (
                    <Grid item sm={6} xs={12} key={attr.key}>
                      <TextField
                        type={
                          attr.title.indexOf('Port') !== -1 ? 'number' : 'text'
                        }
                        fullWidth
                        label={attr.title}
                        value={attr.value}
                        onChange={e => {
                          attributes[index].value = e.target.value
                          setAttributes(attributes.slice(0))
                        }}
                        InputProps={{
                          endAdornment: (
                            <Tooltip title={attr.description}>
                              <InfoIcon />
                            </Tooltip>
                          ),
                        }}
                      />
                    </Grid>
                  )
                })}
              </Grid>
            </>
          }
          footer={
            <Grid container>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => {
                    previousStep()
                  }}
                >
                  Previous
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    setMode('submitting')
                  }}
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          }
        />
      )
    case 'loading':
      return (
        <Step
          content={<CircularProgress />}
          footer={
            <Grid container>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => {
                    previousStep()
                  }}
                >
                  Previous
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {}}
                  disabled
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          }
        />
      )
    default:
      return (
        <Step
          content={<div>Unknown Mode</div>}
          footer={
            <Grid container>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => {
                    previousStep()
                  }}
                >
                  Previous
                </Button>
              </Grid>
              <Grid item>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {}}
                  disabled
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          }
        />
      )
  }
}
