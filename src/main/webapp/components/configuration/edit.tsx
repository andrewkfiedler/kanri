import * as React from 'react'
import {
  ExistingConfigurationType,
  MetatypeType,
  ConfigurationType,
} from '../app-root/app-root.pure'
import { ModalHeader } from '@connexta/atlas/atoms/modal'
import {
  TextField,
  Checkbox,
  MenuItem,
  InputLabel,
} from '@connexta/atlas/atoms/input'
import {
  Formik,
  FormikActions,
  FormikProps,
  Form as FormikForm,
  Field,
  FieldProps,
  FormikFormProps,
} from 'formik'
import { Grid } from '@connexta/atlas/atoms/grid'
import { Button } from '@connexta/atlas/atoms/button'
import { RemoveIcon, AddIcon, InfoIcon } from '@connexta/atlas/atoms/icons'
import { Typography } from '@connexta/atlas/atoms/typography'
import styled from 'styled-components'
import { COMMANDS } from '../fetch/fetch'
import { useServicesContext } from '../services/services.pure'
import {
  useSnackbar,
  generateDismissSnackbarAction,
} from '@connexta/atlas/atoms/snackbar'
import { LinearProgress } from '@material-ui/core'
import { Tooltip } from '@connexta/atlas/atoms/tooltip'
// todo, make a pr or open an issue with formik
const FormikFormFix = FormikForm as React.ComponentType<FormikFormProps>
type Props = (
  | {
      configuration: ExistingConfigurationType
      service?: undefined
    }
  | {
      configuration?: undefined
      service: ConfigurationType
    }) & {
  onClose: () => void
}

const CustomGrid = styled(Grid)`
  overflow: auto;
  overflow-x: hidden;
  > form > * + * {
    margin-top: 20px;
  }
`

type MyFormValues = ExistingConfigurationType['properties']

const Label = ({
  meta,
  children,
}: {
  meta: MetatypeType
  children?: React.ReactNode
}) => {
  return (
    <>
      <InputLabel
        style={{
          cursor: children ? 'pointer' : 'inherit',
        }}
      >
        <Grid container alignItems="center" wrap="nowrap">
          {children ? <Grid item>{children}</Grid> : null}
          <Grid item>{meta.name}</Grid>
          {meta.description !== null ? (
            <Grid item style={{ marginLeft: '10px' }}>
              <Tooltip title={meta.description}>
                <InfoIcon></InfoIcon>
              </Tooltip>
            </Grid>
          ) : null}
        </Grid>
      </InputLabel>
    </>
  )
}

const FieldRender = ({
  meta,
  field,
  form,
  formikBag,
  loading,
}: {
  meta: MetatypeType
  formikBag: FormikProps<MyFormValues>
  loading: boolean
} & FieldProps<MyFormValues>) => {
  if (meta.optionLabels.length > 0) {
    return (
      <div>
        <Label meta={meta}></Label>
        <TextField select fullWidth {...field} disabled={loading}>
          {meta.optionLabels.map((optionLabel, index) => {
            return (
              <MenuItem key={index} value={meta.optionValues[index]}>
                {optionLabel}
              </MenuItem>
            )
          })}
        </TextField>
      </div>
    )
  }
  switch (meta.type) {
    case 3:
      return (
        <div>
          <Label meta={meta}></Label>
          <TextField fullWidth type="number" {...field} disabled={loading} />
          {form.touched.firstName &&
            form.errors.firstName &&
            form.errors.firstName}
        </div>
      )
    case 11:
      return (
        <>
          <Label meta={meta}>
            <Checkbox
              checked={field.value}
              onChange={(e: any) => {
                // @ts-ignore
                const newVal = e.target.checked
                formikBag.setFieldValue(field.name, newVal)
              }}
              disabled={loading}
            />
          </Label>
        </>
      )

    case 1:
    default:
      if (meta.cardinality > 0) {
        if (field.value === undefined) {
        }
        const value = field.value as string[]
        return (
          <div>
            <Label meta={meta}></Label>
            {value.map((subval, index) => {
              return (
                <Grid
                  container
                  spacing={3}
                  alignItems="center"
                  wrap="nowrap"
                  style={{ marginBottom: '5px' }}
                  key={index}
                >
                  <Grid item style={{ width: '100%' }}>
                    <TextField
                      key={index}
                      fullWidth
                      value={subval}
                      onChange={e => {
                        // @ts-ignore
                        const newSubVal = e.target.value
                        const newVal = field.value.slice(0)
                        newVal.splice(index, 1, newSubVal)
                        formikBag.setFieldValue(field.name, newVal)
                      }}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        const newVal = field.value.slice(0)
                        newVal.splice(index, 1)
                        formikBag.setFieldValue(field.name, newVal)
                      }}
                      disabled={loading}
                    >
                      <RemoveIcon />
                    </Button>
                  </Grid>
                </Grid>
              )
            })}
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={() => {
                const newVal = field.value.slice(0)
                newVal.push('')
                formikBag.setFieldValue(field.name, newVal)
              }}
              disabled={loading}
            >
              <AddIcon />
            </Button>
          </div>
        )
      }
      return (
        <div>
          <Label meta={meta}></Label>
          <TextField fullWidth type="text" {...field} disabled={loading} />
          {form.touched.firstName &&
            form.errors.firstName &&
            form.errors.firstName}
        </div>
      )
  }
}

export const ConfigurationEdit = ({
  configuration,
  service,
  onClose,
}: Props) => {
  const { fetchServices } = useServicesContext()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [loading, setLoading] = React.useState(false)
  if (configuration !== undefined && configuration.service !== undefined) {
    return ConfigurationEditRender({
      id: configuration.service.id,
      displayName: configuration.service.name,
      service: configuration.service,
      initialValues: configuration.properties,
      loading,
      onClose,
      onSubmit: values => {
        if (loading) {
          return
        }
        setLoading(true)
        COMMANDS.CONFIGURATION.EDIT({
          body: {
            arguments: [
              configuration.id,
              {
                'service.factoryPid': configuration.fpid,
                'service.pid': configuration.fpid || configuration.id,
                ...values,
              },
            ],
            operation: 'update',
            type: 'EXEC',
            mbean:
              'org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0',
          },
        }).then(response => {
          if (!response.success) {
            enqueueSnackbar(`${configuration.name} update failed`, {
              variant: 'error',
              persist: true,
              action: generateDismissSnackbarAction({ closeSnackbar }),
            })
            setLoading(false)
          } else {
            fetchServices().then(() => {
              enqueueSnackbar(`${configuration.name} updated`, {
                variant: 'success',
                autoHideDuration: 2000,
                action: generateDismissSnackbarAction({ closeSnackbar }),
              })
              onClose()
              setLoading(false)
            })
          }
        })
      },
    })
  } else if (service !== undefined) {
    /**
     * Three choices here, at least with how we do things now.  We're either adding a new config to a factory,
     * editing a non factory from defaults for the first time, or editing a non factory that's already configured.
     *
     * Each choice will have differing initialValues, and each will differ on what happens on save.
     */
    if (service.factory) {
      // adding a new configuration
      return ConfigurationEditRender({
        id: service.id,
        displayName: service.name,
        service,
        loading,
        onClose,
        initialValues: service.metatype.reduce(
          (blob, meta) => {
            blob[meta.id] = meta.defaultValue
            if (meta.cardinality > 0 && blob[meta.id] === null) {
              blob[meta.id] = []
            }
            if (meta.cardinality === 0 && blob[meta.id] instanceof Array) {
              blob[meta.id] = (blob[meta.id] as any[])[0]
            }
            if (meta.type === 11) {
              blob[meta.id] = blob[meta.id] === 'true'
            }
            return blob
          },
          {} as ExistingConfigurationType['properties']
        ),
        onSubmit: async values => {
          if (loading) {
            return
          }
          setLoading(true)
          let addResponse = await COMMANDS.FACTORY.ADD({
            serviceId: service.id,
          })
          if (!addResponse.success) {
            enqueueSnackbar(`Failed to add new ${service.name} `, {
              variant: 'error',
              persist: true,
              action: generateDismissSnackbarAction({ closeSnackbar }),
            })
            setLoading(false)
            return
          }
          const editResponse = await COMMANDS.CONFIGURATION.EDIT({
            body: {
              arguments: [
                addResponse.id,
                {
                  'service.factoryPid': service.id,
                  'service.pid': service.id,
                  ...values,
                },
              ],
              operation: 'update',
              type: 'EXEC',
              mbean:
                'org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0',
            },
          })
          if (!editResponse.success) {
            enqueueSnackbar(`Failed to add new ${service.name} `, {
              variant: 'error',
              persist: true,
              action: generateDismissSnackbarAction({ closeSnackbar }),
            })
            setLoading(false)
          } else {
            fetchServices().then(() => {
              enqueueSnackbar(`Added new ${service.name}`, {
                variant: 'success',
                autoHideDuration: 2000,
                action: generateDismissSnackbarAction({ closeSnackbar }),
              })
              onClose()
              setLoading(false)
            })
          }
        },
      })
    } else if (service.configurations) {
      // editing an existing configuration that's non factory, easiest to recursively handle
      return (
        <ConfigurationEdit
          configuration={service.configurations[0]}
          onClose={onClose}
        />
      )
    } else {
      // editing away from defaults for non factory
      return ConfigurationEditRender({
        id: service.id,
        displayName: service.name,
        service,
        loading,
        onClose,
        initialValues: service.metatype.reduce(
          (blob, meta) => {
            blob[meta.id] = meta.defaultValue
            if (meta.cardinality > 0 && blob[meta.id] === null) {
              blob[meta.id] = []
            }
            if (meta.cardinality === 0 && blob[meta.id] instanceof Array) {
              blob[meta.id] = (blob[meta.id] as any[])[0]
            }
            if (meta.type === 11) {
              blob[meta.id] = blob[meta.id] === 'true'
            }
            return blob
          },
          {} as ExistingConfigurationType['properties']
        ),
        onSubmit: async values => {
          if (loading) {
            return
          }
          setLoading(true)
          const editResponse = await COMMANDS.CONFIGURATION.EDIT({
            body: {
              arguments: [
                service.id,
                {
                  'service.pid': service.id,
                  ...values,
                },
              ],
              operation: 'update',
              type: 'EXEC',
              mbean:
                'org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0',
            },
          })
          if (!editResponse.success) {
            enqueueSnackbar(`${service.name} update failed`, {
              variant: 'error',
              persist: true,
              action: generateDismissSnackbarAction({ closeSnackbar }),
            })
            setLoading(false)
          } else {
            fetchServices().then(() => {
              enqueueSnackbar(`${service.name} updated`, {
                variant: 'success',
                autoHideDuration: 2000,
                action: generateDismissSnackbarAction({ closeSnackbar }),
              })
              onClose()
              setLoading(false)
            })
          }
        },
      })
    }
  } else {
    return <div>Not enough information to edit.</div>
  }
}

/**
 * We need this because formik sees dots as nested objects, but for us it's things like the apache configs with org.apache.blah
 */
const DOT_REPLACEMENT = '_dot_'
const toFormikNotation = (values: ExistingConfigurationType['properties']) => {
  return Object.keys(values).reduce(
    (blob, key) => {
      const newKey = key.split('.').join(DOT_REPLACEMENT)
      blob[newKey] = values[key]
      return blob
    },
    {} as ExistingConfigurationType['properties']
  )
}

const fromFormikNotation = (
  values: ExistingConfigurationType['properties']
) => {
  return Object.keys(values).reduce(
    (blob, key) => {
      const newKey = key.split(DOT_REPLACEMENT).join('.')
      blob[newKey] = values[key]
      return blob
    },
    {} as ExistingConfigurationType['properties']
  )
}

const ConfigurationEditRender = ({
  displayName,
  id,
  service,
  initialValues,
  onSubmit,
  loading,
  onClose,
}: {
  displayName: string
  id: string
  service: ConfigurationType
  initialValues: ExistingConfigurationType['properties']
  onSubmit: (values: MyFormValues, actions: FormikActions<MyFormValues>) => void
  loading: boolean
  onClose: () => void
}) => {
  return (
    <>
      <Formik
        initialValues={toFormikNotation(initialValues)}
        onSubmit={(values, actions) => {
          onSubmit(fromFormikNotation(values), actions)
        }}
        render={(formikBag: FormikProps<MyFormValues>) => (
          <Grid
            container
            direction="column"
            style={{ height: '100%' }}
            wrap="nowrap"
          >
            <Grid item>
              <ModalHeader>
                <Typography>{displayName}</Typography>
                <Typography variant="body2" style={{ wordBreak: 'break-all' }}>
                  {id}
                </Typography>
              </ModalHeader>
            </Grid>
            <CustomGrid item style={{ padding: '0px 10px' }}>
              <FormikFormFix>
                {service.metatype.map(meta => {
                  return (
                    <Field
                      key={meta.id}
                      name={meta.id.split('.').join(DOT_REPLACEMENT)}
                      render={({ field, form }: FieldProps<MyFormValues>) => {
                        return (
                          <div>
                            <FieldRender
                              loading={loading}
                              meta={meta}
                              field={field}
                              form={form}
                              formikBag={formikBag}
                            />
                          </div>
                        )
                      }}
                    />
                  )
                })}
              </FormikFormFix>
            </CustomGrid>
            <Grid item style={{ marginTop: 'auto', width: '100%' }}>
              <Grid
                container
                alignItems="center"
                justify="flex-end"
                spacing={1}
                wrap="nowrap"
                style={{
                  width: '100%',
                  padding: '10px 0px',
                }}
              >
                <Grid item>
                  <Button
                    variant="outlined"
                    color="secondary"
                    disabled={loading}
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      formikBag.submitForm()
                    }}
                    disabled={loading}
                    style={{ position: 'relative' }}
                  >
                    {loading ? (
                      <>
                        <LinearProgress
                          style={{
                            height: '100%',
                            width: '100%',
                            position: 'absolute',
                            opacity: 0.5,
                          }}
                        />
                        <span>Saving</span>
                      </>
                    ) : (
                      <>
                        <span>Save</span>
                      </>
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      />
    </>
  )
}
