import { PluginClient } from '@remixproject/plugin'
import { createClient } from '@remixproject/plugin-webview'
import { processStr } from 'solhint'
import recommendedRules from './recommended-rules'

const log = (...args) => console.log('[Solhint]', ...args)

const solhintReportsContainer = document.querySelector('#solhint-reports')

class SolhintPlugin extends PluginClient {
  constructor(options) {
    super(options)

    this.profile = {
      name: 'solhint',
      displayName: 'Solhint by Protofire',
      location: 'sidePanel',
      icon: 'https://raw.githubusercontent.com/protofire/solhint/master/solhint-icon.png',
      methods: [],
      events: [],
      description: 'Run Solhint in your Remix project',
      version: '0.0.1'
    }
  }
}

log('about to start')

const devMode = { port: 8000 }
const client = createClient(new SolhintPlugin({ devMode }))

require.ensure([], () => {
  client.onload(main)
})

function main() {
  log('running!')

  const severityColorMap = {
    2: '#E74C3C',
    3: '#F39C12'
  }

  client.solidity.on('compilationFinished', async (filename) => {
    log(`${filename} compiled`)

    const file = await client.fileManager.getFile(filename)

    const reporter = processStr(file, {
      rules: {
        ...recommendedRules
      }
    })

    if (reporter.reports.length === 0) {
      log('No reports')
    } else {
      log(`${reporter.reports.length} problems found`)
    }

    await client.editor.discardHighlight()

    reporter.reports.forEach((report) => {
      client.editor.highlight({
        start: {
          line: report.line - 1,
          column: report.column - 1
        },
        end: {
          line: report.line - 1,
          column: report.column
        }
      }, filename, severityColorMap[report.severity])
    })

    solhintReportsContainer.innerHTML = ''
    if (reporter.reports.length) {
      reporter.reports.forEach(report => reportMessage(report, filename))
    } else {
      solhintReportsContainer.innerHTML = 'No errors found'
    }
  })
}

// TODO, remove this and use yo-yo to build report instead
// https://github.com/ethereum/remix-ide/blob/1fe0ede5dee871760006f165733d7885fb235fc5/best-practices.md
function reportMessage(report, filename) {
  const typeOfReport = {
    2: 'danger',
    3: 'warning'
  }
  const messageType = { '2': 'Error', '3': 'Warning' }
  const htmlReport = document.createElement('div')
  const text = new Text(`${filename}:${report.line}:${report.column}: ${messageType[report.severity]}: ${report.message}`)

  htmlReport.classList.add(`sol`)
  htmlReport.classList.add(`${typeOfReport[report.severity]}`)
  htmlReport.classList.add(`alert`)
  htmlReport.classList.add(`alert-${typeOfReport[report.severity]}`)
  const pre = document.createElement('pre')
  pre.style.whiteSpace = 'break-spaces'
  htmlReport
    .appendChild(pre)
    .appendChild(document.createElement('span'))
    .append(text)

  solhintReportsContainer.appendChild(htmlReport)
}
