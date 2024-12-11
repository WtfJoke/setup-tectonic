import {setFailed} from '@actions/core'
import {setUpTectonic} from './setup-tectonic'

const run = async () => {
  try {
    await setUpTectonic()
  } catch (error: unknown) {
    if (error instanceof Error || typeof error === 'string') {
      const message = error instanceof Error ? error.message : error
      setFailed(message)
    } else {
      setFailed('Unknown error')
    }
  }
}

void run()
