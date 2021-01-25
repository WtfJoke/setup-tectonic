import * as core from '@actions/core'
import {setUpTectonic} from './setup-tectonic'

const run = async (): Promise<void> => {
  try {
    await setUpTectonic()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
