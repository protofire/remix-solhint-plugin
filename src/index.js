import { createIframeClient } from '@remixproject/plugin'
import { processStr } from 'solhint'

const log = (...args) => console.log('[Solhint]', ...args)

const devMode = { port: 8000 }
const client = createIframeClient({ devMode })

client.onload(main)

async function main() {
  client.on('solidity', 'compilationFinished', async (filename) => {
    log(`${filename} compiled`)
    const file = await client.fileManager.getFile(filename)
    const reporter = processStr(file, {
      "rules": {
        "reason-string": "warn"
      }
    })
    log(reporter)
    if (reporter.reports.length === 0) {
      log('No reports')
    }
    reporter.reports.forEach((report) => {
      client.editor.highlight({
        start: {
          line: report.line - 1,
          column: report.column - 1
        },
        end: {
          line: report.line - 1,
          column: report.column
        },
      }, filename, '#ff0000')
    })
  })
}
