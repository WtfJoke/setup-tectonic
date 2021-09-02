import * as core from '@actions/core'
import {setUpTectonic} from './setup-tectonic'

const run = async () => {
  try {
    await setUpTectonic()
  } catch (error: unknown) {
    if (error instanceof Error || typeof error === 'string') {
      const message = error instanceof Error ? error.message : error
      core.setFailed(message)
    } else {
      core.setFailed('Unknown error')
    }
  }
}

run()
